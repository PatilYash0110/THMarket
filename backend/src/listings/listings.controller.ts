import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { GeminiService } from '../gemini/gemini.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { GenerateDescriptionDto } from './dto/generate-description.dto';
import { isLikelyImage } from './image-sniff';
import { PurchaseListingDto } from './dto/purchase-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingsService } from './listings.service';

const MAX_IMAGES = 6;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const IMAGE_FILE_INTERCEPTOR_OPTIONS = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, accept: boolean) => void,
  ) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new BadRequestException('Nur Bilddateien sind erlaubt.'), false);
      return;
    }
    callback(null, true);
  },
};

@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly cloudinary: CloudinaryService,
    private readonly gemini: GeminiService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.listingsService.findAll();
  }

  // Registered before ':id' so a request to /listings/favorites doesn't get
  // swallowed by the dynamic :id route.
  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  listFavoriteIds(@CurrentUser() user: JwtPayload) {
    return this.listingsService.listFavoriteIds(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateListingDto) {
    return this.listingsService.create(user.sub, user.role, dto);
  }

  // Throttled — beyond the ordinary request-flooding concern, each upload
  // here now also triggers a Gemini moderation call per image (see below),
  // so an unthrottled loop would run up real API cost/quota too, not just
  // Cloudinary storage.
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', MAX_IMAGES, IMAGE_FILE_INTERCEPTOR_OPTIONS),
  )
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    const images = files ?? [];
    await this.assertImagesAreSafe(images);
    const urls = await this.cloudinary.uploadImages(images);
    return { urls };
  }

  // Only the seller's currently-selected, not-yet-uploaded photos are sent
  // here — not any of the listing's already-Cloudinary-hosted images, which
  // would need a separate fetch-and-reconvert round trip for no real benefit.
  // Throttled tighter than most routes (3/min, via @Throttle overriding the
  // module's default 5/min): this calls the paid Gemini API directly off an
  // authenticated-but-otherwise-unrestricted route, previously with no rate
  // limit at all — a compromised or malicious account could otherwise spam
  // it to exhaust quota/run up cost with nothing but a valid login.
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Post('generate-description')
  @UseInterceptors(
    FilesInterceptor('files', MAX_IMAGES, IMAGE_FILE_INTERCEPTOR_OPTIONS),
  )
  async generateDescription(
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Body() dto: GenerateDescriptionDto,
  ) {
    const images = files ?? [];
    if (images.length === 0 && !dto.hint) {
      throw new BadRequestException(
        'Bitte mindestens ein Foto oder einen Hinweis angeben.',
      );
    }
    this.assertImagesLookLikeImages(images);
    const description = await this.gemini.generateDescription(
      images.map((file) => ({ buffer: file.buffer, mimetype: file.mimetype })),
      dto.hint,
      { title: dto.title, category: dto.category },
    );
    return { description };
  }

  // The multer fileFilter only ever saw the client-supplied Content-Type
  // header (spoofable, and not even available yet as real bytes at that
  // point) — this re-checks each file's actual magic number now that
  // memoryStorage() has the full buffer.
  private assertImagesLookLikeImages(files: Express.Multer.File[]): void {
    if (files.some((file) => !isLikelyImage(file.buffer))) {
      throw new BadRequestException('Eine der Dateien ist kein gültiges Bild.');
    }
  }

  // Only the /upload path (permanently published, Cloudinary-hosted
  // listing photos) runs full content moderation — generate-description's
  // images are ephemeral (sent to Gemini for a description draft, never
  // stored or shown to anyone), so moderating those too would just add
  // latency/cost for no one ever seeing that image.
  private async assertImagesAreSafe(
    files: Express.Multer.File[],
  ): Promise<void> {
    this.assertImagesLookLikeImages(files);
    const verdicts = await Promise.all(
      files.map((file) =>
        this.gemini.moderateImage({
          buffer: file.buffer,
          mimetype: file.mimetype,
        }),
      ),
    );
    if (verdicts.some((safe) => !safe)) {
      throw new BadRequestException(
        'Eines der Fotos wurde als unangemessen eingestuft und konnte nicht hochgeladen werden.',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingsService.update(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/sold')
  markSold(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.listingsService.markSold(id, user.sub, user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.listingsService.remove(id, user.sub);
    return { deleted: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/purchase')
  purchase(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: PurchaseListingDto,
  ) {
    return this.listingsService.purchase(id, user.sub, user.role, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addFavorite(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.listingsService.addFavorite(user.sub, id);
    return { favorited: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFavorite(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.listingsService.removeFavorite(user.sub, id);
    return { favorited: false };
  }
}

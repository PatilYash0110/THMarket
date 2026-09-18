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
import { memoryStorage } from 'multer';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.strategy';
import { GeminiService } from '../gemini/gemini.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { GenerateDescriptionDto } from './dto/generate-description.dto';
import { PurchaseListingDto } from './dto/purchase-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingsService } from './listings.service';

const MAX_IMAGES = 6;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const IMAGE_FILE_INTERCEPTOR_OPTIONS = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req: unknown, file: Express.Multer.File, callback: (error: Error | null, accept: boolean) => void) => {
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateListingDto) {
    return this.listingsService.create(user.sub, user.role, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', MAX_IMAGES, IMAGE_FILE_INTERCEPTOR_OPTIONS))
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = await this.cloudinary.uploadImages(files ?? []);
    return { urls };
  }

  // Only the seller's currently-selected, not-yet-uploaded photos are sent
  // here — not any of the listing's already-Cloudinary-hosted images, which
  // would need a separate fetch-and-reconvert round trip for no real benefit.
  @UseGuards(JwtAuthGuard)
  @Post('generate-description')
  @UseInterceptors(FilesInterceptor('files', MAX_IMAGES, IMAGE_FILE_INTERCEPTOR_OPTIONS))
  async generateDescription(
    @UploadedFiles() files: Express.Multer.File[] | undefined,
    @Body() dto: GenerateDescriptionDto,
  ) {
    if ((!files || files.length === 0) && !dto.hint) {
      throw new BadRequestException('Bitte mindestens ein Foto oder einen Hinweis angeben.');
    }
    const description = await this.gemini.generateDescription(
      (files ?? []).map((file) => ({ buffer: file.buffer, mimetype: file.mimetype })),
      dto.hint,
      { title: dto.title, category: dto.category },
    );
    return { description };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() dto: UpdateListingDto) {
    return this.listingsService.update(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/sold')
  markSold(@Param('id') id: string) {
    return this.listingsService.markSold(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.listingsService.remove(id, user.sub);
    return { deleted: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/purchase')
  purchase(@Param('id') id: string, @CurrentUser() user: JwtPayload, @Body() dto: PurchaseListingDto) {
    return this.listingsService.purchase(id, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  async addFavorite(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.listingsService.addFavorite(user.sub, id);
    return { favorited: true };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/favorite')
  async removeFavorite(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.listingsService.removeFavorite(user.sub, id);
    return { favorited: false };
  }
}

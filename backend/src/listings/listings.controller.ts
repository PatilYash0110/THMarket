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
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingsService } from './listings.service';

const MAX_IMAGES = 6;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Get()
  findAll() {
    return this.listingsService.findAll();
  }

  // Vor ':id' registriert, damit eine Anfrage an /listings/favorites nicht
  // von der dynamischen :id-Route geschluckt wird.
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
  @UseInterceptors(
    FilesInterceptor('files', MAX_IMAGES, {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(new BadRequestException('Nur Bilddateien sind erlaubt.'), false);
          return;
        }
        callback(null, true);
      },
    }),
  )
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = await this.cloudinary.uploadImages(files ?? []);
    return { urls };
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
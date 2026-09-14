import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
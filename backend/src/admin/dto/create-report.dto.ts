import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { REPORT_REASONS } from '../report-reasons';

export class CreateReportDto {
  @IsIn(['LISTING', 'USER'])
  targetType: 'LISTING' | 'USER';

  // Exactly one of listingId/reportedUserId must be set, matching
  // targetType — enforced in AdminService.createReport() since it depends on
  // both fields together, not something a single decorator can express.
  @ValidateIf((dto: CreateReportDto) => dto.targetType === 'LISTING')
  @IsString()
  listingId?: string;

  @ValidateIf((dto: CreateReportDto) => dto.targetType === 'USER')
  @IsString()
  reportedUserId?: string;

  @IsIn(REPORT_REASONS)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}

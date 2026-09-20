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

  // Required (as the report's actual target) when targetType is LISTING —
  // enforced in AdminService.createReport() alongside reportedUserId, since
  // that depends on both fields together. Also accepted, optionally, on a
  // USER report as context: which listing the reported behavior happened
  // around (e.g. reporting a seller from their listing page, or the other
  // participant from a chat bound to one) — lets an admin open it later.
  @ValidateIf((dto: CreateReportDto) => dto.targetType === 'LISTING' || dto.listingId !== undefined)
  @IsString()
  listingId?: string;

  @ValidateIf((dto: CreateReportDto) => dto.targetType === 'USER')
  @IsString()
  reportedUserId?: string;

  // Context, like listingId above: set only when a USER report is filed
  // from within a chat, so an admin can open that exact conversation.
  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsIn(REPORT_REASONS)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}

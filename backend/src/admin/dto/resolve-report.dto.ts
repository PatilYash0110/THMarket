import {
  IsDefined,
  IsIn,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export type ResolveReportAction =
  'NO_ACTION' | 'USER_WARNED' | 'USER_DELETED' | 'LISTING_DELETED';

export class ResolveReportDto {
  @IsIn(['NO_ACTION', 'USER_WARNED', 'USER_DELETED', 'LISTING_DELETED'])
  action: ResolveReportAction;

  // Required for every action except NO_ACTION: for USER_WARNED this note IS
  // the warning text shown to the user; for the delete actions it's the only
  // record anywhere of why an account/listing was removed, since there's no
  // appeal path or notifications system.
  @ValidateIf((dto: ResolveReportDto) => dto.action !== 'NO_ACTION')
  @IsDefined({ message: 'Eine kurze Begründung ist erforderlich.' })
  @IsString()
  @MaxLength(500)
  note?: string;
}

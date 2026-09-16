import { Type } from 'class-transformer';
import { IsDefined, IsInt, Max, Min, ValidateNested } from 'class-validator';
import { MockCardDto } from '../../payments/mock-card';

const MIN_TOPUP_CENTS = 500;
const MAX_TOPUP_CENTS = 50000;

export class TopUpDto {
  @IsInt()
  @Min(MIN_TOPUP_CENTS, { message: 'Mindestbetrag ist 5,00 €.' })
  @Max(MAX_TOPUP_CENTS, { message: 'Höchstbetrag ist 500,00 €.' })
  amountCents: number;

  // @ValidateNested() alone does not reject a missing/undefined value (see
  // purchase-listing.dto.ts) — @IsDefined() is what actually makes this
  // required, without it a missing `card` would crash the service instead
  // of cleanly 400-ing.
  @IsDefined({ message: 'Kartendaten sind erforderlich.' })
  @ValidateNested()
  @Type(() => MockCardDto)
  card: MockCardDto;
}

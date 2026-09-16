import { Type } from 'class-transformer';
import { IsInt, Max, Min, ValidateNested } from 'class-validator';
import { MockCardDto } from '../../payments/mock-card';

const MIN_TOPUP_CENTS = 500;
const MAX_TOPUP_CENTS = 50000;

export class TopUpDto {
  @IsInt()
  @Min(MIN_TOPUP_CENTS, { message: 'Mindestbetrag ist 5,00 €.' })
  @Max(MAX_TOPUP_CENTS, { message: 'Höchstbetrag ist 500,00 €.' })
  amountCents: number;

  @ValidateNested()
  @Type(() => MockCardDto)
  card: MockCardDto;
}

import { Type } from 'class-transformer';
import { IsDefined, IsInt, Max, Min, ValidateNested } from 'class-validator';
import { MockCardDto } from '../../payments/mock-card';

const MIN_WITHDRAW_CENTS = 500;
const MAX_WITHDRAW_CENTS = 50000;

export class WithdrawDto {
  @IsInt()
  @Min(MIN_WITHDRAW_CENTS, { message: 'Mindestbetrag ist 5,00 €.' })
  @Max(MAX_WITHDRAW_CENTS, { message: 'Höchstbetrag ist 500,00 €.' })
  amountCents: number;

  // @IsDefined() is required alongside @ValidateNested() — the latter alone
  // does not reject a missing/undefined card (see top-up.dto.ts).
  @IsDefined({ message: 'Kartendaten sind erforderlich.' })
  @ValidateNested()
  @Type(() => MockCardDto)
  card: MockCardDto;
}

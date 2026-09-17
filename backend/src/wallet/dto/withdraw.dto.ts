import { Type } from 'class-transformer';
import { IsDefined, IsInt, Max, Min, ValidateNested } from 'class-validator';
import { MockCardDto } from '../../payments/mock-card';

const MAX_WITHDRAW_CENTS = 50000;

export class WithdrawDto {
  // Unlike TopUpDto, no business-meaningful minimum here — the real floor is
  // "don't withdraw more than you have" (checked in the service against the
  // live balance), not an arbitrary amount. A 5€ minimum copied verbatim
  // from top-up would make a full-balance withdrawal below that threshold
  // permanently impossible, which defeats the point of a "cash out" action.
  @IsInt()
  @Min(1, { message: 'Betrag muss größer als 0 sein.' })
  @Max(MAX_WITHDRAW_CENTS, { message: 'Höchstbetrag ist 500,00 €.' })
  amountCents: number;

  // @IsDefined() is required alongside @ValidateNested() — the latter alone
  // does not reject a missing/undefined card (see top-up.dto.ts).
  @IsDefined({ message: 'Kartendaten sind erforderlich.' })
  @ValidateNested()
  @Type(() => MockCardDto)
  card: MockCardDto;
}

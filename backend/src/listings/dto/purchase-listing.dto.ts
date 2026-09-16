import { Type } from 'class-transformer';
import { IsIn, ValidateIf, ValidateNested } from 'class-validator';
import { MockCardDto } from '../../payments/mock-card';

export class PurchaseListingDto {
  @IsIn(['simulation', 'guthaben'])
  paymentMethod: 'simulation' | 'guthaben';

  // Required only for 'simulation' (Guthaben doesn't take a card at checkout
  // time — it spends an already-loaded balance). No @IsOptional() here on
  // purpose: when the condition is true, @ValidateNested() still rejects a
  // missing/undefined card.
  @ValidateIf((dto: PurchaseListingDto) => dto.paymentMethod === 'simulation')
  @ValidateNested()
  @Type(() => MockCardDto)
  card?: MockCardDto;
}

import { Type } from 'class-transformer';
import { IsDefined, IsIn, ValidateIf, ValidateNested } from 'class-validator';
import { MockCardDto } from '../../payments/mock-card';

export class PurchaseListingDto {
  @IsIn(['simulation', 'guthaben'])
  paymentMethod: 'simulation' | 'guthaben';

  // Required only for 'simulation' (Guthaben doesn't take a card at checkout
  // time — it spends an already-loaded balance). @ValidateNested() alone does
  // NOT reject a missing/undefined value — it only validates the object if
  // one is present, so a missing card here would otherwise sail through the
  // DTO and crash the service with a raw TypeError (confirmed by hand: it
  // did). @IsDefined() is what actually enforces presence.
  @ValidateIf((dto: PurchaseListingDto) => dto.paymentMethod === 'simulation')
  @IsDefined({ message: 'Kartendaten sind erforderlich.' })
  @ValidateNested()
  @Type(() => MockCardDto)
  card?: MockCardDto;
}

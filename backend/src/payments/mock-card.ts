import { BadRequestException } from '@nestjs/common';
import { IsString } from 'class-validator';

// Plain functions/constants, not a Nest module — there's nothing to inject
// here, so an @Injectable() with no dependencies would just add ceremony.
// Shared between the listings purchase flow and the wallet top-up flow.

export class MockCardDto {
  @IsString({ message: 'Kartennummer ist erforderlich.' })
  number: string;

  @IsString({ message: 'Ablaufdatum ist erforderlich.' })
  expiry: string;

  @IsString({ message: 'CVC ist erforderlich.' })
  cvc: string;
}

export const MOCK_CARD = {
  number: '4242424242424242',
  expiry: '12/29',
  cvc: '123',
};

export function validateMockCard(card: MockCardDto): void {
  const number = card.number.trim().replace(/\s+/g, '');
  const expiry = card.expiry.trim();
  const cvc = card.cvc.trim();

  if (number !== MOCK_CARD.number || expiry !== MOCK_CARD.expiry || cvc !== MOCK_CARD.cvc) {
    throw new BadRequestException(
      'Ungültige Kartendaten. Bitte verwende die Testkarte 4242 4242 4242 4242, 12/29, CVC 123.',
    );
  }
}

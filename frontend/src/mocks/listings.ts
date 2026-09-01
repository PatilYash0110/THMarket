import type { Listing } from '../types'
import { MOCK_STUDENT } from './users'

function img(seed: string) {
  return `https://picsum.photos/seed/${seed}/640/640`
}

export const INITIAL_LISTINGS: Listing[] = [
  {
    id: 'listing-1',
    title: 'MacBook Air M1, 256GB',
    description:
      'Verkaufe mein MacBook Air M1 in sehr gutem Zustand. Wenig genutzt, keine Kratzer, inkl. Original-Ladegerät. Ideal für Studium und Programmieren.',
    priceCents: 65000,
    category: 'Elektronik',
    images: [img('macbook-1'), img('macbook-2')],
    sofortkaufMoeglich: true,
    status: 'AKTIV',
    sellerId: MOCK_STUDENT.id,
    createdAt: '2026-08-20T10:00:00.000Z',
  },
  {
    id: 'listing-2',
    title: 'Lehrbuch: Grundlagen der Softwaretechnik',
    description:
      'Aktuelle Auflage, kaum Gebrauchsspuren, keine Markierungen. Perfekt für Projekt 1.',
    priceCents: 1800,
    category: 'Bücher & Skripte',
    images: [img('book-1')],
    sofortkaufMoeglich: true,
    status: 'AKTIV',
    sellerId: MOCK_STUDENT.id,
    createdAt: '2026-08-22T14:30:00.000Z',
  },
  {
    id: 'listing-3',
    title: 'Schreibtisch, höhenverstellbar',
    description:
      'Elektrisch höhenverstellbarer Schreibtisch, 140x70cm. Selbstabholung in Gießen.',
    priceCents: 12000,
    category: 'Möbel',
    images: [img('desk-1')],
    sofortkaufMoeglich: false,
    status: 'AKTIV',
    sellerId: MOCK_STUDENT.id,
    createdAt: '2026-08-18T09:15:00.000Z',
  },
  {
    id: 'listing-4',
    title: 'Trekkingrad 28 Zoll',
    description:
      'Zuverlässiges Trekkingrad, 21-Gang-Schaltung, neue Bremsbeläge. Ideal für den Weg zur Hochschule.',
    priceCents: 22000,
    category: 'Fahrräder',
    images: [img('bike-1'), img('bike-2')],
    sofortkaufMoeglich: true,
    status: 'AKTIV',
    sellerId: MOCK_STUDENT.id,
    createdAt: '2026-08-15T16:45:00.000Z',
  },
  {
    id: 'listing-5',
    title: 'Winterjacke Gr. M',
    description: 'Warme Winterjacke, kaum getragen, Herrengröße M.',
    priceCents: 3500,
    category: 'Kleidung',
    images: [img('jacket-1')],
    sofortkaufMoeglich: true,
    status: 'VERKAUFT',
    sellerId: MOCK_STUDENT.id,
    createdAt: '2026-08-10T11:20:00.000Z',
  },
  {
    id: 'listing-6',
    title: 'Grafikrechner TI-84 Plus',
    description: 'Voll funktionsfähig, mit Anleitung und Tasche.',
    priceCents: 4500,
    category: 'Elektronik',
    images: [img('calculator-1')],
    sofortkaufMoeglich: false,
    status: 'AKTIV',
    sellerId: MOCK_STUDENT.id,
    createdAt: '2026-08-25T08:00:00.000Z',
  },
  {
    id: 'listing-7',
    title: 'Bürostuhl, ergonomisch',
    description: 'Ergonomischer Bürostuhl mit Lendenwirbelstütze, verstellbare Armlehnen.',
    priceCents: 8000,
    category: 'Möbel',
    images: [img('chair-1')],
    sofortkaufMoeglich: true,
    status: 'AKTIV',
    sellerId: MOCK_STUDENT.id,
    createdAt: '2026-08-27T13:10:00.000Z',
  },
  {
    id: 'listing-8',
    title: 'Kiste Kleinteile: Kabel & Adapter',
    description: 'Verschiedene USB-C-Kabel, Adapter und ein altes Ladegerät, alles zusammen.',
    priceCents: 800,
    category: 'Sonstiges',
    images: [img('cables-1')],
    sofortkaufMoeglich: false,
    status: 'AKTIV',
    sellerId: MOCK_STUDENT.id,
    createdAt: '2026-08-28T17:40:00.000Z',
  },
]

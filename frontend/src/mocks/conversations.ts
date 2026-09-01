import type { Conversation } from '../types'
import { MOCK_ADMIN, MOCK_STUDENT } from './users'

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conversation-1',
    listingId: 'listing-3',
    participantIds: [MOCK_STUDENT.id, MOCK_ADMIN.id],
    messages: [
      {
        id: 'message-1',
        conversationId: 'conversation-1',
        senderId: MOCK_ADMIN.id,
        text: 'Hallo, ist der Schreibtisch noch verfügbar?',
        sentAt: '2026-08-29T09:00:00.000Z',
      },
      {
        id: 'message-2',
        conversationId: 'conversation-1',
        senderId: MOCK_STUDENT.id,
        text: 'Ja, ist noch da. Abholung ab Montag möglich.',
        sentAt: '2026-08-29T09:12:00.000Z',
      },
    ],
  },
]

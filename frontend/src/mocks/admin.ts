export interface Report {
    id: string
    targetLabel: string
    reason: string
    reportedBy: string
    status: 'OFFEN' | 'BEARBEITET'
    createdAt: string
  }
  
  export interface AuditLogEntry {
    id: string
    actor: string
    action: string
    createdAt: string
  }
  
  export const MOCK_REPORTS: Report[] = [
    {
      id: 'report-1',
      targetLabel: 'Inserat: "Winterjacke Gr. M"',
      reason: 'Verdacht auf gefälschte Marke',
      reportedBy: 'anonym',
      status: 'OFFEN',
      createdAt: '2026-08-29T10:00:00.000Z',
    },
    {
      id: 'report-2',
      targetLabel: 'Nutzer: max.tester@thm.de',
      reason: 'Unangemessene Nachrichten im Chat',
      reportedBy: 'Lena Becker',
      status: 'BEARBEITET',
      createdAt: '2026-08-24T15:30:00.000Z',
    },
  ]
  
  export const MOCK_AUDIT_LOG: AuditLogEntry[] = [
    {
      id: 'audit-1',
      actor: 'THM Administration',
      action: 'Meldung "Winterjacke Gr. M" geprüft, keine Maßnahme',
      createdAt: '2026-08-29T11:00:00.000Z',
    },
    {
      id: 'audit-2',
      actor: 'THM Administration',
      action: 'Nutzer max.tester@thm.de verwarnt',
      createdAt: '2026-08-24T16:00:00.000Z',
    },
  ]
  
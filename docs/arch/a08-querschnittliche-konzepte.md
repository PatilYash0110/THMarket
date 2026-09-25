# A08. Querschnittliche Konzepte


## A08.1 Persistenz

**Ziel**

Einheitliches Muster für Datenbankzugriffe (CRUD über Prisma) und sichere Passwortspeicherung.

**Technische Umsetzung**

- PostgreSQL (Neon) als persistente Datenbasis. Zugriff ausschließlich über Prisma, gekapselt in einem global bereitgestellten `PrismaService`.
- Sieben Kern-Entitäten: User, Listing, Favorite, Report, AuditLogEntry, Conversation, Message — keine eigenen Tabellen für Bilder, Kategorien, Transaktionen oder Bewertungen.
- Passwörter werden mit bcrypt gehasht.
- Antworten externer Dienste werden nicht persistiert; nur die resultierenden Bild-URLs bzw. Beschreibungstexte landen in der Datenbank.

### A08.1.1 Zentraler Datenbankzugriff

Der Datenbankzugriff läuft über einen einzigen, global bereitgestellten Prisma-Client, der die Verbindung beim Start auf- und beim Herunterfahren abbaut:

```typescript
@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```

### A08.1.2 Passwörter sicher speichern

Beim Registrieren wird das Passwort gehasht, beim Login nur noch der Hash verglichen — der Klartext wird nie gespeichert:

```typescript
// Registrierung (auth.service.ts)
const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS); // 12
await this.prisma.user.create({
  data: { name: dto.name, email: dto.email, passwordHash, emailVerificationToken, emailVerificationExpires },
});

// Login (auth.service.ts)
const ok = await bcrypt.compare(dto.password, user.passwordHash);
if (!ok) throw new UnauthorizedException('Ungültige E-Mail-Adresse oder Passwort.');
const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role });
```

### A08.1.3 Atomare, konkurrenzsichere Schreibzugriffe

Der Kaufabschluss ist der kritischste Schreibvorgang: Zwei parallele Käufe desselben Inserats dürfen nicht beide gelingen, und kein Konto darf sein Guthaben überziehen. Die Bedingungen stehen deshalb direkt im `WHERE` der Aktualisierung, innerhalb einer Transaktion:

```typescript
return this.prisma.$transaction(async (tx) => {
  const sold = await tx.listing.updateMany({
    where: { id, status: 'AKTIV' }, // nur wenn noch aktiv
    data: { status: 'VERKAUFT', buyerId },
  });
  if (sold.count === 0)
    throw new ConflictException('Bereits verkauft.');

  const debited = await tx.user.updateMany({
    where: { id: buyerId, balanceCents: { gte: listing.priceCents } },
    data: { balanceCents: { decrement: listing.priceCents } },
  });
  if (debited.count === 0)
    throw new BadRequestException('Nicht genügend Guthaben.');
});
```

## A08.2 Sicherheit & Datenschutz

**Ziel**

Zugang nur für verifizierte THM-Konten, Schutz der Sitzungen, strikte Rollentrennung sowie Abwehr der typischen Web-Angriffe (CSRF, ungültige Eingaben, Brute-Force).

### A08.2.1 Zugang nur für verifizierte THM-Konten

Die Zugehörigkeit zur THM wird serverseitig über ein festes Muster erzwungen — auch Subdomains wie `@mnd.thm.de` sind erlaubt:

```typescript
const THM_EMAIL_PATTERN = /^[^\s@]+@([a-z0-9-]+\.)*thm\.de$/i;

@Matches(THM_EMAIL_PATTERN, {
  message: 'Bitte verwende eine gültige @thm.de-Adresse …',
})
email: string;
```

### A08.2.2 JWT im httpOnly-Cookie & Sitzungsentwertung

Das JWT wird bevorzugt aus einem httpOnly-Cookie gelesen (für Browser, unsichtbar für JavaScript), ersatzweise aus dem Bearer-Header (curl/Tests). Bei jeder Anfrage wird geprüft, ob die Sitzung noch gültig ist:

```typescript
jwtFromRequest: ExtractJwt.fromExtractors([
  cookieExtractor,
  ExtractJwt.fromAuthHeaderAsBearerToken(),
]),
async validate(payload: JwtPayload) {
  // entwertet Tokens, die vor der letzten Passwortänderung
  // ausgestellt wurden, und solche gelöschter Konten
  await assertSessionStillValid(this.prisma, payload.sub, payload.iat);
  return payload;
}
```

### A08.2.3 Rollenbasierte Zugriffskontrolle

Privilegierte Admin-Routen sind hinter einem eigenen Guard gebündelt, der die Rolle aus dem geprüften JWT liest:

```typescript
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    return req.user?.role === 'ADMIN';
  }
}
```

### A08.2.4 CSRF-Schutz & Eingabevalidierung

Schreibende Cross-Site-Anfragen werden anhand von Origin und Sec-Fetch-Site abgewiesen, alle Eingaben laufen durch eine global konfigurierte Validierung, die unbekannte Felder verwirft:

```typescript
app.use((req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin))
    return res.status(403).json({ message: 'Ungültiger Origin.' });
  next();
});

app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

### A08.2.5 Rate-Limiting gegen Missbrauch

Rate-Limiting ist nicht flächendeckend, sondern gezielt auf die missbrauchsanfälligen Endpunkte begrenzt. Der Modul-Default gilt nur dort, wo der `ThrottlerGuard` aktiv ist, einzelne Routen überschreiben ihn:

| Endpunkt | Limit | Schlüssel |
|---|---|---|
| register (Registrierung) | 15 / Minute | IP |
| resend-verification | 5 / Minute | IP |
| login | 5 / Minute | E-Mail + IP |
| forgot-password | 5 / Minute | E-Mail + IP |
| generate-description (KI-Beschreibung) | 3 / Minute | IP |
| `POST /admin/reports` (Meldung erstellen) | 5 / Minute | IP |

*Rate-Limits der missbrauchsanfälligen Endpunkte*

### A08.2.6 Fail-open bei externer Moderation

Fällt die KI-Bildmoderation aus, wird nicht die Kernfunktion (Inserieren) blockiert, sondern der Upload durchgelassen und der Vorfall im Audit-Log festgehalten:

```typescript
async moderateImage(image): Promise<boolean> {
  try {
    const res = await this.ai.models.generateContent({ /* … */ });
    return res.text?.trim().toUpperCase() !== 'UNSAFE';
  } catch (error) {
    await this.prisma.auditLogEntry.create({
      data: { action: 'KI-Bildmoderation fehlgeschlagen — Upload durchgelassen' },
    });
    return true; // fail-open: Kernfunktion bleibt verfügbar
  }
}
```

## A08.3 API

**Ziel**

Eine einheitliche REST-Schnittstelle als einziger Zugang des Frontends zum Backend. Der Chat läuft zusätzlich über Socket.io-Events. Antworten erfolgen als JSON und geschützte Endpunkte erfordern ein JWT (Cookie oder Authorization-Header).

### A08.3.1 Aufbau eines Controllers

Controller sind schlank: Sie deklarieren Route, Guards und Rate-Limit und delegieren die Fachlogik an den zugehörigen Service:

```typescript
@Controller('listings')
export class ListingsController {
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() { return this.listingsService.findAll(); }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Post('generate-description')
  generateDescription(@Body() dto: GenerateDescriptionDto) { /* … */ }
}
```

### A08.3.2 Endpunktübersicht

Die folgende Tabelle listet die tatsächlichen Endpunkte, verifiziert gegen die Controller unter `backend/src`:

| Methode | Pfad | Zweck |
|---|---|---|
| POST | `/auth/register` | Registrierung |
| GET | `/auth/verify-email` | E-Mail-Verifizierung |
| POST | `/auth/resend-verification` | Neuen Verifizierungslink anfordern |
| POST | `/auth/login` | Anmeldung |
| POST | `/auth/logout` | Abmeldung |
| POST | `/auth/forgot-password` | Passwort-Reset anfordern |
| POST | `/auth/reset-password` | Neues Passwort setzen |
| GET / PATCH | `/auth/me` | Eigenes Profil lesen / ändern |
| POST | `/auth/dismiss-warning` | Admin-Verwarnung quittieren |
| GET | `/listings` | Alle aktiven Inserate laden (Filterung clientseitig) |
| GET | `/listings/favorites` | Eigene Favoriten laden |
| GET | `/listings/:id` | Inseratdetails |
| POST | `/listings` | Inserat anlegen |
| POST | `/listings/upload` | Bild-Upload (Cloudinary) |
| POST | `/listings/generate-description` | KI-Beschreibungsvorschlag |
| PATCH | `/listings/:id` | Inserat bearbeiten |
| PATCH | `/listings/:id/sold` | Als verkauft markieren |
| DELETE | `/listings/:id` | Inserat löschen |
| POST | `/listings/:id/purchase` | Kauf abschließen |
| POST / DELETE | `/listings/:id/favorite` | Favorisieren / entfernen |
| POST | `/wallet/topup` | Guthaben aufladen |
| POST | `/wallet/withdraw` | Guthaben auszahlen |
| POST | `/conversations` | Konversation starten |
| GET | `/conversations` | Eigene Konversationen auflisten |
| GET | `/conversations/:id/messages` | Nachrichtenverlauf |
| POST | `/conversations/:id/read` | Konversation als gelesen markieren |
| Socket.io | `joinConversation`, `sendMessage` | Echtzeit-Nachrichten |
| POST | `/admin/reports` | Meldung erstellen |
| GET | `/admin/reports` | Meldungen auflisten |
| GET | `/admin/conversations/:id/messages` | Chat-Verlauf im Meldungskontext |
| PATCH | `/admin/reports/:id/resolve` | Meldung auflösen (Maßnahme) |
| GET | `/admin/users` | Nutzerkonten auflisten |
| DELETE | `/admin/users/:id` | Nutzerkonto löschen |
| DELETE | `/admin/listings/:id` | Inserat löschen (Admin) |
| GET | `/admin/audit-log` | Audit-Log einsehen |



import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

// `name` is user-supplied (the registration form) and interpolated into
// these HTML bodies below — without this, a name like `<img src=x
// onerror=...>` would ride along verbatim into an email an HTML-rendering
// mail client executes. Only ever mailed to that same user's own inbox, so
// the realistic impact is self-XSS at best, but it costs nothing to escape.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null;

  constructor(private readonly config: ConfigService) {
    const user = this.config.get<string>('GMAIL_USER');
    const pass = this.config.get<string>('GMAIL_APP_PASSWORD');

    this.transporter =
      user && pass
        ? nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass },
          })
        : null;
  }

  async sendVerificationEmail(to: string, name: string, verifyUrl: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `GMAIL_USER/GMAIL_APP_PASSWORD not set — logging verification link instead of sending email.`,
      );
      this.logger.log(`Verification link for ${to}: ${verifyUrl}`);
      return;
    }

    await this.transporter.sendMail({
      from: `"THMarket" <${this.config.get<string>('GMAIL_USER')}>`,
      to,
      subject: 'Bestätige deine E-Mail-Adresse — THMarket',
      text: `Hallo ${name},\n\nbitte bestätige deine E-Mail-Adresse, um dein THMarket-Konto zu aktivieren:\n${verifyUrl}\n\nDieser Link ist 24 Stunden gültig.`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <p>Hallo ${escapeHtml(name)},</p>
          <p>bitte bestätige deine E-Mail-Adresse, um dein THMarket-Konto zu aktivieren:</p>
          <p>
            <a href="${verifyUrl}" style="display:inline-block;background:#1b1e21;color:#fff;padding:12px 24px;text-decoration:none;">
              E-Mail bestätigen
            </a>
          </p>
          <p style="color:#6b6d72;font-size:13px;">Dieser Link ist 24 Stunden gültig.</p>
        </div>
      `,
    });
    this.logger.log(`Verification email sent to ${to}`);
  }

  // Sent instead of a 409 when someone tries to register an @thm.de
  // address that already has an account — see AuthService.register(). The
  // API response itself stays identical to a real registration, so this
  // email is the only place the account's actual owner learns anything.
  async sendAccountExistsEmail(to: string, name: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `GMAIL_USER/GMAIL_APP_PASSWORD not set — logging account-exists notice instead of sending email.`,
      );
      this.logger.log(`Account-exists notice for ${to}`);
      return;
    }

    await this.transporter.sendMail({
      from: `"THMarket" <${this.config.get<string>('GMAIL_USER')}>`,
      to,
      subject: 'Du hast bereits ein Konto — THMarket',
      text: `Hallo ${name},\n\njemand hat versucht, mit dieser E-Mail-Adresse ein neues THMarket-Konto zu erstellen — du hast aber schon eines. Falls das du warst, kannst du dich ganz normal anmelden oder dein Passwort zurücksetzen. Falls nicht, kannst du diese E-Mail ignorieren.`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <p>Hallo ${escapeHtml(name)},</p>
          <p>jemand hat versucht, mit dieser E-Mail-Adresse ein neues THMarket-Konto zu erstellen — du hast aber schon eines.</p>
          <p>Falls das du warst, kannst du dich ganz normal anmelden oder dein Passwort zurücksetzen. Falls nicht, kannst du diese E-Mail ignorieren.</p>
        </div>
      `,
    });
    this.logger.log(`Account-exists notice sent to ${to}`);
  }

  async sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(
        `GMAIL_USER/GMAIL_APP_PASSWORD not set — logging password reset link instead of sending email.`,
      );
      this.logger.log(`Password reset link for ${to}: ${resetUrl}`);
      return;
    }

    await this.transporter.sendMail({
      from: `"THMarket" <${this.config.get<string>('GMAIL_USER')}>`,
      to,
      subject: 'Passwort zurücksetzen — THMarket',
      text: `Hallo ${name},\n\ndu hast angefordert, dein THMarket-Passwort zurückzusetzen:\n${resetUrl}\n\nDieser Link ist 1 Stunde gültig. Falls du das nicht warst, kannst du diese E-Mail ignorieren.`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <p>Hallo ${escapeHtml(name)},</p>
          <p>du hast angefordert, dein THMarket-Passwort zurückzusetzen:</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;background:#1b1e21;color:#fff;padding:12px 24px;text-decoration:none;">
              Passwort zurücksetzen
            </a>
          </p>
          <p style="color:#6b6d72;font-size:13px;">Dieser Link ist 1 Stunde gültig. Falls du das nicht warst, kannst du diese E-Mail ignorieren.</p>
        </div>
      `,
    });
    this.logger.log(`Password reset email sent to ${to}`);
  }
}

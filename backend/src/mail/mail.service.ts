import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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
          <p>Hallo ${name},</p>
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
}
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = 'gemini-3.6-flash';

const INSTRUCTION =
  'Du bist Teil eines Flohmarkt-Inserats für THM-Studierende. Schreibe auf Deutsch einen ' +
  'kurzen, sachlichen Beschreibungstext für dieses Inserat aus Käufersicht — Zustand, ' +
  'auffällige Merkmale, ggf. Zubehör. Nur Fließtext, keine Überschriften, kein Markdown, ' +
  'keine Emojis, keine Anrede und keine Erfindungen, die sich nicht aus den Bildern oder ' +
  'dem Hinweis ergeben.';

const MODERATION_INSTRUCTION =
  'Du prüfst ein Foto, das zu einem Flohmarkt-Inserat für THM-Studierende hochgeladen ' +
  'werden soll. Antworte NUR mit dem einzelnen Wort UNSAFE, wenn das Bild explizite ' +
  'Nacktheit, sexuelle Inhalte, grafische Gewalt, Hasssymbole, Waffen als Hauptmotiv oder ' +
  'anderweitig für eine Studierenden-Plattform unangemessene Inhalte zeigt. Antworte in ' +
  'jedem anderen Fall NUR mit dem einzelnen Wort SAFE. Kein weiterer Text.';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.ai = new GoogleGenAI({ apiKey: this.config.getOrThrow<string>('GEMINI_API_KEY') });
    this.model = this.config.get<string>('GEMINI_MODEL') ?? DEFAULT_MODEL;
  }

  // Fails OPEN, not closed: if Gemini is down, slow, or over quota, a
  // moderation outage would otherwise take down the one core feature of the
  // whole marketplace (posting a listing). Same philosophy CLAUDE.md already
  // states for the description feature ("if Gemini fails, fall back to
  // manual") — here the fallback is "let the upload through, logged", not
  // "block everything". A human can still act on a reported photo afterward
  // via the existing admin/report flow.
  async moderateImage(image: { buffer: Buffer; mimetype: string }): Promise<boolean> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: [
          { inlineData: { mimeType: image.mimetype, data: image.buffer.toString('base64') } },
          { text: MODERATION_INSTRUCTION },
        ],
      });
      const verdict = response.text?.trim().toUpperCase();
      return verdict !== 'UNSAFE';
    } catch (error) {
      this.logger.warn(`Image moderation call failed, allowing upload through: ${error}`);
      return true;
    }
  }

  async generateDescription(
    images: { buffer: Buffer; mimetype: string }[],
    hint?: string,
    context?: { title?: string; category?: string },
  ): Promise<string> {
    const contextLines = [
      context?.title ? `Titel: ${context.title}` : null,
      context?.category ? `Kategorie: ${context.category}` : null,
      hint ? `Hinweis des Verkäufers: ${hint}` : null,
    ].filter((line): line is string => line !== null);

    const contents = [
      ...images.map((image) => ({
        inlineData: { mimeType: image.mimetype, data: image.buffer.toString('base64') },
      })),
      { text: [INSTRUCTION, ...contextLines].join('\n') },
    ];

    const response = await this.ai.models.generateContent({ model: this.model, contents });
    const text = response.text?.trim();
    if (!text) {
      throw new BadRequestException('Gemini hat keinen Beschreibungstext geliefert.');
    }
    return text;
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = 'gemini-3.6-flash';

const INSTRUCTION =
  'Du bist Teil eines Flohmarkt-Inserats für THM-Studierende. Schreibe auf Deutsch einen ' +
  'kurzen, sachlichen Beschreibungstext für dieses Inserat aus Käufersicht — Zustand, ' +
  'auffällige Merkmale, ggf. Zubehör. Nur Fließtext, keine Überschriften, kein Markdown, ' +
  'keine Emojis, keine Anrede und keine Erfindungen, die sich nicht aus den Bildern oder ' +
  'dem Hinweis ergeben.';

@Injectable()
export class GeminiService {
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.ai = new GoogleGenAI({ apiKey: this.config.getOrThrow<string>('GEMINI_API_KEY') });
    this.model = this.config.get<string>('GEMINI_MODEL') ?? DEFAULT_MODEL;
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

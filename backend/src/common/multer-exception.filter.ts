import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { MulterError } from 'multer';

// Multer throws its own MulterError for upload constraint violations (too
// many files, wrong field name, oversized file past its own limit check) —
// Nest doesn't recognize it as an HttpException, so it previously fell
// through to an unhandled 500 instead of a normal 400.
@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    response.status(400).json({
      statusCode: 400,
      error: 'Bad Request',
      message: this.messageFor(exception),
    });
  }

  private messageFor(exception: MulterError): string {
    switch (exception.code) {
      case 'LIMIT_UNEXPECTED_FILE':
        return 'Zu viele Dateien ausgewählt.';
      case 'LIMIT_FILE_SIZE':
        return 'Eine Datei ist zu groß.';
      default:
        return 'Datei-Upload fehlgeschlagen.';
    }
  }
}

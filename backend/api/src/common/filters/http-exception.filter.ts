import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: unknown | undefined = undefined;
    let code = 'INTERNAL_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res?.message ?? exception.message;
      details = res?.details ?? res;
      code = res?.code ?? (status >= 500 ? 'SERVER_ERROR' : 'REQUEST_ERROR');
    }

    // Log full exception for debugging
    // eslint-disable-next-line no-console
    console.error('[Exception]', { status, code, message, details: details ?? exception });

    response.status(status).json({ code, message, details });
  }
}



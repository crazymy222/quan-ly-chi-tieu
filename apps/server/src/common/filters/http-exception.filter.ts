import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { DEFAULT_RESPONSE_MESSAGES } from '../constants/response-message.const';

export interface ExceptionResponse {
  statusCode: number;
  status: 'error';
  error: string;
  message: string;
  data: null;
  timestamp: string;
  path: string;
  method: string;
}

const INTERNAL_SERVER_ERROR_MESSAGE = DEFAULT_RESPONSE_MESSAGES[HttpStatus.INTERNAL_SERVER_ERROR]!;

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = INTERNAL_SERVER_ERROR_MESSAGE;
    let error: string = 'UnknowError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.constructor.name;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.constructor.name;
      } else {
        message = exception.message;
        error = exception.constructor.name;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || INTERNAL_SERVER_ERROR_MESSAGE;
      error = exception.constructor.name;
    } else {
      // Handle completely unknown exceptions
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = INTERNAL_SERVER_ERROR_MESSAGE;
      error = 'UnknownError';
    }

    if (typeof status !== 'number' || status < 100 || status > 599) {
      this.logger.error(`Invalid status code detected: ${status}, using 500 instead`);
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    const errorResponse: ExceptionResponse = {
      statusCode: status,
      status: 'error',
      data: null,
      error: error,
      message: Array.isArray(message) ? message.join(', ') : message,
      method: request.method,
      path: request.url,
      timestamp: new Date().toISOString()
    };

    if (status >= 500) {
      this.logger.error(
        `HTTP ${status} Error Response: ${JSON.stringify(errorResponse)}`,
        undefined,
        `${request.method} ${request.url}`
      );
    } else {
      this.logger.warn(
        `HTTP ${status} Error Response: ${JSON.stringify(errorResponse)}`,
        `${request.method} ${request.url}`
      );
    }

    if (response.headersSent) {
      const detail =
        exception instanceof Error ? exception.stack ?? exception.message : String(exception);
      this.logger.warn(
        `Skipped error JSON — response already sent (${request.method} ${request.url})\n${detail}`,
      );
      return;
    }

    try {
      response.status(status).json(errorResponse);
    } catch (sendErr) {
      this.logger.error(
        `Failed to send error response: ${JSON.stringify(errorResponse)}`,
        sendErr instanceof Error ? sendErr.stack : String(sendErr),
        `${request.method} ${request.url}`,
      );

      if (!response.headersSent) {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          data: null,
          error: 'ResponseError',
          status: 'error',
          message: 'Failed to process error response',
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        } as ExceptionResponse);
      }
    }
  }
}
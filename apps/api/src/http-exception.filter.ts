import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;

    const payload =
      typeof exceptionResponse === "object" && exceptionResponse !== null
        ? (exceptionResponse as { message?: string | string[]; details?: unknown })
        : null;

    const message =
      status === HttpStatus.INTERNAL_SERVER_ERROR
        ? "Error interno del servidor"
        : Array.isArray(payload?.message)
          ? payload.message.join(", ")
          : payload?.message || (exception instanceof Error ? exception.message : "Error");

    response.status(status).json({
      error: {
        message,
        details: payload?.details,
      },
    });
  }
}

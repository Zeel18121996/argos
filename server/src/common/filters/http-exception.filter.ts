import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import type { Request, Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    // Extract validation errors array if present (from ValidationPipe)
    let errors: unknown[] | undefined
    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse &&
      Array.isArray((exceptionResponse as Record<string, unknown>).message)
    ) {
      errors = (exceptionResponse as Record<string, unknown>).message as unknown[]
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}

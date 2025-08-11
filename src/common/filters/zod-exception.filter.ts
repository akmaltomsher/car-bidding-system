import { join, resolve } from 'path';
import { unlinkSync } from 'fs';
import { Response } from 'express';
import { get, isArray, isEmpty, isObject, isString } from 'lodash';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

export class ZodExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let validationErrors = null;
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();
      validationErrors = this.extractValidationErrors(exceptionResponse);

      message =
        typeof exceptionResponse === 'object' && exceptionResponse['message']
          ? exceptionResponse['message']
          : exception.message || 'Validation failed';
    } else if (exception instanceof Error) {
      const mongoError = exception as Error & {
        code?: number;
        keyPattern?: Record<string, any>;
        keyValue?: Record<string, any>;
      };
      if (mongoError.code === 11000 && mongoError.keyPattern && mongoError.keyValue) {
        const duplicateField = Object.keys(mongoError.keyPattern)[0];
        const duplicateValue = mongoError.keyValue[duplicateField];
        message = `${this.formatFieldName(duplicateField)} "${duplicateValue}" already exists.`;
        validationErrors = {
          [duplicateField]: message,
        };
      } else {
        message = mongoError.message || 'Internal Server Error';
        validationErrors = { general: message };
      }
    }

    this.deleteUploadedFile(request);

    response.status(200).json({
      status: false,
      error: true,
      requestedData: null,
      message,
      validation: validationErrors || { general: message },
      checkReLogin: this.checkReLogin(exception),
      isVerified: this.checkIsVerified(exception),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private formatFieldName(field: string): string {
    const mappings: Record<string, string> = {
      email: 'Email address',
      name: 'Name',
    };

    if (mappings[field]) return mappings[field];
    const formatted = field
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_\-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

    return formatted;
  }

  private extractValidationErrors(exceptionResponse: any): Record<string, string> | null {
    if (isObject(exceptionResponse) && 'errors' in exceptionResponse) {
      const errors = get(exceptionResponse, 'errors', []);
      if (isArray(errors)) {
        return errors.reduce((acc, curr) => {
          acc[curr.path.join('.')] = curr.message;
          return acc;
        }, {});
      }
    }

    if (!isEmpty(exceptionResponse?.validation)) {
      return exceptionResponse.validation;
    }

    return null;
  }

  private checkReLogin(exceptionResponse: any): boolean {
    const parsedResponse =
      isObject(exceptionResponse) && 'response' in exceptionResponse
        ? exceptionResponse.response
        : isString(exceptionResponse)
          ? { message: exceptionResponse }
          : exceptionResponse;
    const reLogin = get(parsedResponse, 'response.reLogin', get(parsedResponse, 'reLogin', false));
    return reLogin;
  }
  private checkIsVerified(exceptionResponse: any): boolean {
    const parsedResponse =
      isObject(exceptionResponse) && 'response' in exceptionResponse
        ? exceptionResponse.response
        : isString(exceptionResponse)
          ? { message: exceptionResponse }
          : exceptionResponse;
    const isVerified = get(parsedResponse, 'response.isVerified', get(parsedResponse, 'isVerified', true));
    return isVerified;
  }

  private deleteUploadedFile(request: any): void {
    const file = request.file;
    if (!file || isEmpty(file)) {
      return;
    }
    if (!file.destination) {
      return;
    }
    const uploadFolder = resolve(file.destination);
    const filePath = join(uploadFolder, file.filename);
    try {
      unlinkSync(filePath);
      console.log(`Deleted uploaded file: ${filePath}`);
    } catch (unlinkError: any) {
      console.error(`Error deleting file: ${unlinkError.message}`);
    }
  }
}

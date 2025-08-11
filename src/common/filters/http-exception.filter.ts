import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { unlinkSync } from 'fs';
import { isObject, get, isEmpty } from 'lodash';
import { MongoServerError } from 'mongodb';
import * as mongoose from 'mongoose';
import { resolve, join } from 'path';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'An error occurred';
    let validation = null;

    console.error('Caught exception:', exception);

    if (isObject(exception) && 'message' in exception && 'status' in exception) {
      message = get(exception, 'message', 'An error occurred');
      validation = get(exception, 'validation', null);
      status = HttpStatus.UNAUTHORIZED;
    }

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (isObject(exceptionResponse) && get(exceptionResponse, 'message')) {
        const responseObject = exceptionResponse as Record<string, any>;
        message = get(responseObject, 'message', message);
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    }

    if (exception instanceof MongoServerError && exception.code === 11000) {
      const duplicateField = Object.keys(exception.keyPattern)[0];
      message = `Duplicate value found for ${duplicateField}. This field must be unique.`;
      status = HttpStatus.BAD_REQUEST;
      validation = { [duplicateField]: `${duplicateField} must be unique.` };
    }

    if (exception instanceof mongoose.Error.ValidationError) {
      message = 'Validation failed for one or more fields';
      validation = Object.keys(exception.errors).reduce((acc: any, key: string) => {
        acc[key] = exception.errors[key].message;
        return acc;
      }, {});
      status = HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof mongoose.Error.CastError) {
      message = `Invalid value for ${exception.path}. Expected ${exception.kind}.`;
      status = HttpStatus.BAD_REQUEST;
      validation = { [exception.path]: `Invalid value for ${exception.path}.` };
    }

    if (exception instanceof Error && exception.message) {
      message = exception.message;
    }

    if (!validation) {
      validation = { general: message || 'An unexpected error occurred' };
    }
    this.deleteUploadedFile(request);

    response.status(200).json({
      status: 200,
      error: status >= 400,
      requestedData: null,
      message,
      ...(validation ? { validation } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private deleteUploadedFile(request: Request): void {
    const file = request.file;
    if (!isEmpty(file)) {
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
}

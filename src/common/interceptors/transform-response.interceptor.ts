import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { get, isEmpty } from 'lodash';

@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => {
        const status = get(data, 'status', true);
        const message = get(data, 'message', 'Success');
        const validation = get(data, 'validation', {});
        const totalCount = get(data, 'totalCount', null);
        const requestedData = get(data, 'data', data);

        const responseBody: any = {
          status: status !== false,
          message,
          requestedData,
        };

        if (totalCount !== null) {
          responseBody.totalCount = totalCount;
        }

        if (!isEmpty(validation)) {
          responseBody.validation = validation;
        }

        response.status(HttpStatus.OK);
        return responseBody;
      }),
    );
  }
}

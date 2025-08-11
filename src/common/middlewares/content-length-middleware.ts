import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';

@Injectable()
export class ContentLengthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const contentLength = req.headers['content-length'];

    // if (req.method === 'GET' && contentLength && contentLength !== '0') {
    //     console.warn('Unexpected Content-Length for GET request:', contentLength);
    //     throw new BadRequestException('Invalid Content-Length for GET request');
    // }
    next();
  }
}

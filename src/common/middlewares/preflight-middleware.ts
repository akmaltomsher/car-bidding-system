import { Injectable, NestMiddleware } from '@nestjs/common';
import { origins } from 'src/config/origins';

@Injectable()
export class PreflightMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const requestOrigin = req.headers.origin;

    if (req.method === 'OPTIONS') {
      if (origins.includes(requestOrigin)) {
        res.header('Access-Control-Allow-Origin', requestOrigin);
      }
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(204).send();
    } else {
      next();
    }
  }
}

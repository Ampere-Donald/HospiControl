import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus() {
    return {
      status: 'ok',
      service: 'HospiControl API',
      version: '1.0.0',
    };
  }
}

import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Route publique de santé (utilisée pour vérifier que l'API répond). */
  @Public()
  @Get()
  getStatus() {
    return this.appService.getStatus();
  }
}

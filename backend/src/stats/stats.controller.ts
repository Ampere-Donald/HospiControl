import { Controller, Get } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly stats: StatsService) {}

  @Roles('SUPER_ADMIN')
  @Get('plateforme')
  plateforme() {
    return this.stats.plateforme();
  }
}

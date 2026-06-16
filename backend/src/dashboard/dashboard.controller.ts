import { Controller, Get } from '@nestjs/common';
import type { AuthUser } from '../common/auth-user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  /** Agrégats du tableau de bord pour l'hôpital connecté. */
  @Roles('MEDECIN', 'ACCUEIL', 'ADMIN_HOPITAL')
  @Get()
  resume(@CurrentUser() user: AuthUser) {
    return this.dashboard.resume(user);
  }
}

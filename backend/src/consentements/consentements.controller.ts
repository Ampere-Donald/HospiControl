import { Controller, Get, Param, Patch, Post } from '@nestjs/common';
import type { AuthUser } from '../common/auth-user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { ConsentementsService } from './consentements.service';

@Controller('patients/:patientId/consentement')
export class ConsentementsController {
  constructor(private readonly consentements: ConsentementsService) {}

  @Roles('ACCUEIL', 'ADMIN_HOPITAL', 'MEDECIN')
  @Get()
  statut(@Param('patientId') patientId: string, @CurrentUser() user: AuthUser) {
    return this.consentements.statut(patientId, user);
  }

  @Roles('ACCUEIL', 'ADMIN_HOPITAL')
  @Post()
  autoriser(@Param('patientId') patientId: string, @CurrentUser() user: AuthUser) {
    return this.consentements.autoriser(patientId, user);
  }

  @Roles('ACCUEIL', 'ADMIN_HOPITAL')
  @Patch('revoquer')
  revoquer(@Param('patientId') patientId: string, @CurrentUser() user: AuthUser) {
    return this.consentements.revoquer(patientId, user);
  }
}

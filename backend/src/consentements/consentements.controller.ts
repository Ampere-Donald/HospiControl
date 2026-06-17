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

  /** L'hôpital demande l'accès -> EN_ATTENTE + lien magique pour le patient. */
  @Roles('ACCUEIL', 'ADMIN_HOPITAL')
  @Post('demander')
  demander(
    @Param('patientId') patientId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.consentements.demander(patientId, user);
  }

  /** Consentement présentiel attesté par l'accueil (patient sans email). */
  @Roles('ACCUEIL', 'ADMIN_HOPITAL')
  @Post('presentiel')
  presentiel(
    @Param('patientId') patientId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.consentements.presentiel(patientId, user);
  }

  @Roles('ACCUEIL', 'ADMIN_HOPITAL')
  @Patch('revoquer')
  revoquer(
    @Param('patientId') patientId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.consentements.revoquer(patientId, user);
  }
}

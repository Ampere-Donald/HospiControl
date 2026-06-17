import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import type { AuthUser } from '../common/auth-user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { DecisionDto } from './dto/decision.dto';
import { EspacePatientService } from './espace-patient.service';

/** Portail patient. Toutes les routes exigent un jeton patient (rôle PATIENT). */
@Controller('espace-patient')
export class EspacePatientController {
  constructor(private readonly service: EspacePatientService) {}

  @Roles('PATIENT')
  @Get('moi')
  moi(@CurrentUser() user: AuthUser) {
    return this.service.moi(user.id);
  }

  @Roles('PATIENT')
  @Get('consentements')
  consentements(@CurrentUser() user: AuthUser) {
    return this.service.consentements(user.id);
  }

  @Roles('PATIENT')
  @Patch('consentements/:hopitalId')
  decider(
    @CurrentUser() user: AuthUser,
    @Param('hopitalId') hopitalId: string,
    @Body() dto: DecisionDto,
  ) {
    return this.service.decider(user.id, hopitalId, dto.decision);
  }

  @Roles('PATIENT')
  @Get('journal')
  journal(@CurrentUser() user: AuthUser) {
    return this.service.journalAcces(user.id);
  }
}

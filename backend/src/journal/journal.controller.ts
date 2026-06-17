import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JournalService } from './journal.service';

@Controller()
export class JournalController {
  constructor(private readonly journal: JournalService) {}

  /** Journal d'accès d'un patient (médecin). */
  @Roles('MEDECIN')
  @Get('patients/:patientId/journal')
  pourPatient(@Param('patientId') patientId: string) {
    return this.journal.pourPatient(patientId);
  }

  /** Journal d'accès de toute la plateforme (super admin / Vue globale). */
  @Roles('SUPER_ADMIN')
  @Get('journal')
  plateforme() {
    return this.journal.plateforme();
  }
}

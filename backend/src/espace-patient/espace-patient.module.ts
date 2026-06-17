import { Module } from '@nestjs/common';
import { EspacePatientController } from './espace-patient.controller';
import { EspacePatientService } from './espace-patient.service';

// PrismaService et JournalService sont globaux -> rien à importer.
@Module({
  controllers: [EspacePatientController],
  providers: [EspacePatientService],
})
export class EspacePatientModule {}

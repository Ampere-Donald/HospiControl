import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { AuthUser } from '../common/auth-user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CarnetService } from './carnet.service';
import { CreateAntecedentDto } from './dto/create-antecedent.dto';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Roles('MEDECIN')
@Controller()
export class CarnetController {
  constructor(private readonly carnet: CarnetService) {}

  @Get('patients/:patientId/carnet')
  getCarnet(
    @Param('patientId') patientId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.carnet.getCarnet(patientId, user);
  }

  @Post('patients/:patientId/antecedents')
  ajouterAntecedent(
    @Param('patientId') patientId: string,
    @Body() dto: CreateAntecedentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.carnet.ajouterAntecedent(patientId, dto, user);
  }

  @Post('patients/:patientId/consultations')
  ajouterConsultation(
    @Param('patientId') patientId: string,
    @Body() dto: CreateConsultationDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.carnet.ajouterConsultation(patientId, dto, user);
  }

  @Get('consultations/mes')
  mesConsultations(@CurrentUser() user: AuthUser) {
    return this.carnet.mesConsultations(user);
  }

  @Get('consultations/:id')
  detailConsultation(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.carnet.detailConsultation(id, user);
  }

  @Post('consultations/:id/prescriptions')
  ajouterPrescription(
    @Param('id') id: string,
    @Body() dto: CreatePrescriptionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.carnet.ajouterPrescription(id, dto, user);
  }
}

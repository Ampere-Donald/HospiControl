import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthUser } from '../common/auth-user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  // NB : 'recherche' doit être déclaré AVANT ':id' pour ne pas être capturé.
  @Roles('MEDECIN', 'ACCUEIL', 'ADMIN_HOPITAL')
  @Get('recherche')
  recherche(@Query('telephone') telephone: string) {
    return this.patients.rechercheParTelephone(telephone ?? '');
  }

  @Roles('MEDECIN', 'ACCUEIL')
  @Post()
  create(@Body() dto: CreatePatientDto, @CurrentUser() user: AuthUser) {
    return this.patients.create(dto, user.hopitalId);
  }

  @Roles('MEDECIN', 'ACCUEIL', 'ADMIN_HOPITAL')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patients.findOne(id);
  }

  @Roles('MEDECIN', 'ACCUEIL')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patients.update(id, dto);
  }
}

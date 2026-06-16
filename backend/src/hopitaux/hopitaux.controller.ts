import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateHopitalDto } from './dto/create-hopital.dto';
import { UpdateHopitalDto } from './dto/update-hopital.dto';
import { HopitauxService } from './hopitaux.service';

@Roles('SUPER_ADMIN')
@Controller('hopitaux')
export class HopitauxController {
  constructor(private readonly hopitaux: HopitauxService) {}

  @Post()
  create(@Body() dto: CreateHopitalDto) {
    return this.hopitaux.create(dto);
  }

  @Get()
  findAll() {
    return this.hopitaux.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hopitaux.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateHopitalDto) {
    return this.hopitaux.update(id, dto);
  }

  @Patch(':id/desactiver')
  desactiver(@Param('id') id: string) {
    return this.hopitaux.desactiver(id);
  }
}

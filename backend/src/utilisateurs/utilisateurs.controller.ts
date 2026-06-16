import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type { AuthUser } from '../common/auth-user';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';
import { UtilisateursService } from './utilisateurs.service';

@Roles('ADMIN_HOPITAL')
@Controller('utilisateurs')
export class UtilisateursController {
  constructor(private readonly utilisateurs: UtilisateursService) {}

  /** hopitalId est toujours pris du token, jamais du body (anti-triche). */
  private hopitalId(user: AuthUser): string {
    if (!user.hopitalId) {
      throw new ForbiddenException(
        "Votre compte n'est rattaché à aucun hôpital.",
      );
    }
    return user.hopitalId;
  }

  @Post()
  create(@Body() dto: CreateUtilisateurDto, @CurrentUser() user: AuthUser) {
    return this.utilisateurs.create(dto, this.hopitalId(user));
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.utilisateurs.findAll(this.hopitalId(user));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.utilisateurs.findOne(id, this.hopitalId(user));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUtilisateurDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.utilisateurs.update(id, dto, this.hopitalId(user));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.utilisateurs.remove(id, this.hopitalId(user), user.id);
  }
}

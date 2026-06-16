import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { decouperNomComplet } from '../common/utils/noms';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { UpdateUtilisateurDto } from './dto/update-utilisateur.dto';

@Injectable()
export class UtilisateursService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUtilisateurDto, hopitalId: string) {
    const email = dto.email.toLowerCase().trim();
    const existant = await this.prisma.utilisateur.findUnique({
      where: { email },
    });
    if (existant) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà.');
    }

    const { prenom, nom } = decouperNomComplet(dto.nomComplet);
    const motDePasseHash = await argon2.hash(dto.motDePasse);

    return this.prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        telephone: dto.telephone,
        role: dto.role,
        hopitalId,
        motDePasseHash,
      },
      omit: { motDePasseHash: true },
    });
  }

  findAll(hopitalId: string) {
    return this.prisma.utilisateur.findMany({
      where: { hopitalId },
      omit: { motDePasseHash: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, hopitalId: string) {
    // findFirst avec hopitalId : un admin ne peut atteindre qu'un utilisateur de SON hôpital.
    const utilisateur = await this.prisma.utilisateur.findFirst({
      where: { id, hopitalId },
      omit: { motDePasseHash: true },
    });
    if (!utilisateur) throw new NotFoundException('Utilisateur introuvable.');
    return utilisateur;
  }

  async update(id: string, dto: UpdateUtilisateurDto, hopitalId: string) {
    await this.findOne(id, hopitalId); // garantit le même hôpital

    const data: Prisma.UtilisateurUpdateInput = {};
    if (dto.nomComplet) {
      const { prenom, nom } = decouperNomComplet(dto.nomComplet);
      data.prenom = prenom;
      data.nom = nom;
    }
    if (dto.email) data.email = dto.email.toLowerCase().trim();
    if (dto.telephone !== undefined) data.telephone = dto.telephone;
    if (dto.role) data.role = dto.role;
    if (dto.motDePasse) data.motDePasseHash = await argon2.hash(dto.motDePasse);

    return this.prisma.utilisateur.update({
      where: { id },
      data,
      omit: { motDePasseHash: true },
    });
  }

  async remove(id: string, hopitalId: string, currentUserId: string) {
    const cible = await this.findOne(id, hopitalId);
    if (cible.id === currentUserId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas supprimer votre propre compte.',
      );
    }
    await this.prisma.utilisateur.delete({ where: { id } });
    return { success: true };
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { genererMotDePasseTemporaire } from '../common/utils/mot-de-passe';
import { decouperNomComplet } from '../common/utils/noms';
import { CreateHopitalDto } from './dto/create-hopital.dto';
import { UpdateHopitalDto } from './dto/update-hopital.dto';

// Champs d'utilisateur exposés (jamais le hash du mot de passe).
const ADMIN_RESUME = {
  id: true,
  nom: true,
  prenom: true,
  email: true,
  telephone: true,
  role: true,
} as const;

@Injectable()
export class HopitauxService {
  constructor(private readonly prisma: PrismaService) {}

  /** Crée l'hôpital ET son administrateur (mot de passe temporaire généré). */
  async create(dto: CreateHopitalDto) {
    const email = dto.admin.email.toLowerCase().trim();
    const existant = await this.prisma.utilisateur.findUnique({
      where: { email },
    });
    if (existant) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà.');
    }

    const motDePasseTemporaire = genererMotDePasseTemporaire();
    const motDePasseHash = await argon2.hash(motDePasseTemporaire);
    const { prenom, nom } = decouperNomComplet(dto.admin.nomComplet);

    const hopital = await this.prisma.hopital.create({
      data: {
        nom: dto.nom,
        ville: dto.ville,
        type: dto.type,
        telephone: dto.telephone,
        utilisateurs: {
          create: {
            nom,
            prenom,
            email,
            telephone: dto.admin.telephone,
            role: 'ADMIN_HOPITAL',
            motDePasseHash,
            mustChangePassword: true,
          },
        },
      },
      include: {
        utilisateurs: { where: { role: 'ADMIN_HOPITAL' }, select: ADMIN_RESUME },
        _count: { select: { utilisateurs: true } },
      },
    });

    // Le mot de passe temporaire n'est renvoyé qu'ici, une seule fois.
    return { hopital, adminMotDePasseTemporaire: motDePasseTemporaire };
  }

  findAll() {
    return this.prisma.hopital.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        utilisateurs: {
          where: { role: 'ADMIN_HOPITAL' },
          select: ADMIN_RESUME,
          take: 1,
        },
        _count: { select: { utilisateurs: true } },
      },
    });
  }

  async findOne(id: string) {
    const hopital = await this.prisma.hopital.findUnique({
      where: { id },
      include: {
        utilisateurs: { select: ADMIN_RESUME },
        _count: { select: { utilisateurs: true } },
      },
    });
    if (!hopital) throw new NotFoundException('Hôpital introuvable.');
    return hopital;
  }

  async update(id: string, dto: UpdateHopitalDto) {
    await this.findOne(id);
    return this.prisma.hopital.update({ where: { id }, data: dto });
  }

  async desactiver(id: string) {
    await this.findOne(id);
    return this.prisma.hopital.update({ where: { id }, data: { actif: false } });
  }

  /** Suppression définitive — autorisée seulement si aucune donnée médicale. */
  async supprimer(id: string) {
    const hopital = await this.prisma.hopital.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            patients: true,
            consultations: true,
            antecedents: true,
            consentements: true,
          },
        },
      },
    });
    if (!hopital) throw new NotFoundException('Hôpital introuvable.');
    const c = hopital._count;
    if (c.patients > 0 || c.consultations > 0 || c.antecedents > 0 || c.consentements > 0) {
      throw new ConflictException(
        'Cet hôpital a des données médicales. Désactivez-le plutôt que de le supprimer.',
      );
    }
    // Aucune donnée médicale : on retire ses utilisateurs puis l'hôpital.
    await this.prisma.$transaction([
      this.prisma.utilisateur.deleteMany({ where: { hopitalId: id } }),
      this.prisma.hopital.delete({ where: { id } }),
    ]);
    return { success: true };
  }
}

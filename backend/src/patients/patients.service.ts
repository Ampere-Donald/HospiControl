import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normaliserTelephone } from '../common/utils/telephone';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

// Origine du dossier (hôpital créateur) renvoyée avec le patient.
const AVEC_ORIGINE = {
  hopitalCreateur: { select: { id: true, nom: true, ville: true } },
  tuteur: { select: { id: true, nom: true, prenom: true, telephone: true } },
};

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Recherche globale par téléphone (tous hôpitaux confondus). */
  async rechercheParTelephone(telephone: string) {
    const cle = normaliserTelephone(telephone);
    if (!cle) {
      return { trouve: false, cle: '', patient: null };
    }
    const patient = await this.prisma.patient.findUnique({
      where: { telephone: cle },
      include: AVEC_ORIGINE,
    });
    return { trouve: Boolean(patient), cle, patient };
  }

  async create(dto: CreatePatientDto, hopitalId: string | null) {
    const cle = normaliserTelephone(dto.telephone);
    if (cle.length < 8) {
      throw new BadRequestException('Numéro de téléphone invalide.');
    }
    const existant = await this.prisma.patient.findUnique({
      where: { telephone: cle },
    });
    if (existant) {
      throw new ConflictException('Un patient avec ce numéro existe déjà.');
    }
    if (dto.cni) {
      const memeCni = await this.prisma.patient.findFirst({
        where: { cni: dto.cni },
      });
      if (memeCni) {
        throw new ConflictException('Un patient avec cette CNI existe déjà.');
      }
    }
    return this.prisma.patient.create({
      data: {
        telephone: cle,
        nom: dto.nom,
        prenom: dto.prenom,
        dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
        sexe: dto.sexe,
        groupeSanguin: dto.groupeSanguin,
        adresse: dto.adresse,
        cni: dto.cni,
        tuteurId: dto.tuteurId,
        hopitalCreateurId: hopitalId ?? undefined,
      },
      include: AVEC_ORIGINE,
    });
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: AVEC_ORIGINE,
    });
    if (!patient) throw new NotFoundException('Patient introuvable.');
    return patient;
  }

  async update(id: string, dto: UpdatePatientDto) {
    await this.findOne(id);
    return this.prisma.patient.update({
      where: { id },
      data: {
        nom: dto.nom,
        prenom: dto.prenom,
        dateNaissance: dto.dateNaissance ? new Date(dto.dateNaissance) : undefined,
        sexe: dto.sexe,
        groupeSanguin: dto.groupeSanguin,
        adresse: dto.adresse,
        cni: dto.cni,
      },
      include: AVEC_ORIGINE,
    });
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../common/auth-user';
import { CreateAntecedentDto } from './dto/create-antecedent.dto';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

const HOPITAL_RESUME = { select: { id: true, nom: true, ville: true } };
const MEDECIN_RESUME = { select: { id: true, nom: true, prenom: true } };

@Injectable()
export class CarnetService {
  constructor(private readonly prisma: PrismaService) {}

  private async patientOuErreur(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException('Patient introuvable.');
    return patient;
  }

  private hopitalDe(user: AuthUser): string {
    if (!user.hopitalId) {
      throw new ForbiddenException("Votre compte n'est rattaché à aucun hôpital.");
    }
    return user.hopitalId;
  }

  /**
   * Lecture du carnet (GUIDE §7). Un hôpital voit TOUJOURS ses propres données ;
   * il voit celles des autres hôpitaux uniquement si un consentement AUTORISE
   * existe pour ce patient et cet hôpital. La révocation a un effet immédiat
   * car le filtre est recalculé à chaque lecture.
   */
  async getCarnet(patientId: string, user: AuthUser) {
    await this.patientOuErreur(patientId);
    const hopitalCourant = this.hopitalDe(user);

    const consentement = await this.prisma.consentement.findUnique({
      where: {
        patientId_hopitalId: { patientId, hopitalId: hopitalCourant },
      },
    });
    const partageAutorise = consentement?.statut === 'AUTORISE';

    const consultations = await this.prisma.consultation.findMany({
      where: partageAutorise
        ? { patientId }
        : { patientId, hopitalId: hopitalCourant },
      include: {
        prescriptions: true,
        hopital: HOPITAL_RESUME,
        medecin: MEDECIN_RESUME,
      },
      orderBy: { date: 'desc' },
    });

    const antecedents = await this.prisma.antecedent.findMany({
      where: partageAutorise
        ? { patientId }
        : { patientId, hopitalCreateurId: hopitalCourant },
      include: { hopitalCreateur: HOPITAL_RESUME },
      orderBy: { createdAt: 'desc' },
    });

    return {
      partageAutorise,
      antecedents: antecedents.map((a) => ({
        ...a,
        estPropreHopital: a.hopitalCreateurId === hopitalCourant,
      })),
      consultations: consultations.map((c) => ({
        ...c,
        estPropreHopital: c.hopitalId === hopitalCourant,
      })),
    };
  }

  /** Les consultations créées par le médecin connecté (vue « Mes consultations »). */
  mesConsultations(user: AuthUser) {
    return this.prisma.consultation.findMany({
      where: { medecinId: user.id },
      include: {
        prescriptions: true,
        patient: {
          select: { id: true, nom: true, prenom: true, telephone: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 50,
    });
  }

  async ajouterAntecedent(
    patientId: string,
    dto: CreateAntecedentDto,
    user: AuthUser,
  ) {
    await this.patientOuErreur(patientId);
    const hopitalCreateurId = this.hopitalDe(user);
    return this.prisma.antecedent.create({
      data: {
        patientId,
        type: dto.type,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : undefined,
        hopitalCreateurId,
      },
    });
  }

  async ajouterConsultation(
    patientId: string,
    dto: CreateConsultationDto,
    user: AuthUser,
  ) {
    await this.patientOuErreur(patientId);
    const hopitalId = this.hopitalDe(user);
    return this.prisma.consultation.create({
      data: {
        patientId,
        hopitalId,
        medecinId: user.id,
        motif: dto.motif,
        diagnostic: dto.diagnostic,
        notes: dto.notes,
        prescriptions: dto.prescriptions?.length
          ? {
              create: dto.prescriptions.map((p) => ({
                medicament: p.medicament,
                posologie: p.posologie,
                duree: p.duree,
              })),
            }
          : undefined,
      },
      include: {
        prescriptions: true,
        hopital: HOPITAL_RESUME,
        medecin: MEDECIN_RESUME,
      },
    });
  }

  async detailConsultation(id: string, user: AuthUser) {
    const hopitalCourant = this.hopitalDe(user);
    const consultation = await this.prisma.consultation.findFirst({
      where: { id, hopitalId: hopitalCourant },
      include: {
        prescriptions: true,
        hopital: HOPITAL_RESUME,
        medecin: MEDECIN_RESUME,
      },
    });
    if (!consultation) throw new NotFoundException('Consultation introuvable.');
    return consultation;
  }

  async ajouterPrescription(
    consultationId: string,
    dto: CreatePrescriptionDto,
    user: AuthUser,
  ) {
    const hopitalCourant = this.hopitalDe(user);
    const consultation = await this.prisma.consultation.findFirst({
      where: { id: consultationId, hopitalId: hopitalCourant },
    });
    if (!consultation) throw new NotFoundException('Consultation introuvable.');
    return this.prisma.prescription.create({
      data: {
        consultationId,
        medicament: dto.medicament,
        posologie: dto.posologie,
        duree: dto.duree,
      },
    });
  }
}

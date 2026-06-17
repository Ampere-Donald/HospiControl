import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JournalService } from '../journal/journal.service';
import type { AuthUser } from '../common/auth-user';

@Injectable()
export class ConsentementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly journal: JournalService,
  ) {}

  private hopitalDe(user: AuthUser): string {
    if (!user.hopitalId) {
      throw new ForbiddenException("Votre compte n'est rattaché à aucun hôpital.");
    }
    return user.hopitalId;
  }

  private async patientOuErreur(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException('Patient introuvable.');
  }

  /** Statut du consentement de l'hôpital connecté pour ce patient. */
  async statut(patientId: string, user: AuthUser) {
    await this.patientOuErreur(patientId);
    const hopitalId = this.hopitalDe(user);
    const consentement = await this.prisma.consentement.findUnique({
      where: { patientId_hopitalId: { patientId, hopitalId } },
    });
    return {
      statut: consentement?.statut ?? null,
      autorise: consentement?.statut === 'AUTORISE',
      dateModification: consentement?.dateModification ?? null,
    };
  }

  /** Le patient (via l'accueil) autorise l'hôpital connecté à voir son carnet. */
  async autoriser(patientId: string, user: AuthUser) {
    await this.patientOuErreur(patientId);
    const hopitalId = this.hopitalDe(user);
    const consentement = await this.prisma.consentement.upsert({
      where: { patientId_hopitalId: { patientId, hopitalId } },
      create: { patientId, hopitalId, statut: 'AUTORISE' },
      update: { statut: 'AUTORISE' },
    });
    void this.journal.enregistrer({
      type: 'CONSENTEMENT_AUTORISE',
      patientId,
      hopitalId,
      acteurUtilisateurId: user.id,
    });
    return consentement;
  }

  /** Révocation : l'hôpital reperd immédiatement l'accès à l'historique des autres. */
  async revoquer(patientId: string, user: AuthUser) {
    await this.patientOuErreur(patientId);
    const hopitalId = this.hopitalDe(user);
    const consentement = await this.prisma.consentement.upsert({
      where: { patientId_hopitalId: { patientId, hopitalId } },
      create: { patientId, hopitalId, statut: 'REVOQUE' },
      update: { statut: 'REVOQUE' },
    });
    void this.journal.enregistrer({
      type: 'CONSENTEMENT_REVOQUE',
      patientId,
      hopitalId,
      acteurUtilisateurId: user.id,
    });
    return consentement;
  }
}

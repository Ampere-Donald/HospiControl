import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JournalService } from '../journal/journal.service';
import type { AuthUser } from '../common/auth-user';

@Injectable()
export class ConsentementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly journal: JournalService,
    private readonly jwt: JwtService,
  ) {}

  private hopitalDe(user: AuthUser): string {
    if (!user.hopitalId) {
      throw new ForbiddenException(
        "Votre compte n'est rattaché à aucun hôpital.",
      );
    }
    return user.hopitalId;
  }

  private async patientOuErreur(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException('Patient introuvable.');
    return patient;
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

  /**
   * Bloc 1 — l'hôpital DEMANDE l'accès (au lieu de s'auto-autoriser).
   * Crée une demande EN_ATTENTE + un lien magique : c'est le PATIENT qui décidera.
   */
  async demander(patientId: string, user: AuthUser) {
    const patient = await this.patientOuErreur(patientId);
    const hopitalId = this.hopitalDe(user);
    await this.prisma.consentement.upsert({
      where: { patientId_hopitalId: { patientId, hopitalId } },
      create: { patientId, hopitalId, statut: 'EN_ATTENTE' },
      update: { statut: 'EN_ATTENTE' },
    });
    void this.journal.enregistrer({
      type: 'DEMANDE_ACCES',
      patientId,
      hopitalId,
      acteurUtilisateurId: user.id,
    });
    // Lien magique = JWT patient. Mode simulé : le lien s'affiche à l'accueil
    // (à envoyer par email au patient ; vrai envoi branchable plus tard).
    const token = await this.jwt.signAsync(
      { sub: patientId, role: 'PATIENT', hopitalId: null },
      { expiresIn: '30d' as `${number}d` },
    );
    return {
      statut: 'EN_ATTENTE' as const,
      email: patient.email,
      lienMagique: `/espace-patient/${token}`,
    };
  }

  /**
   * Bloc 1.3 — présentiel en secours : le patient n'a pas d'email, l'accueil
   * atteste son consentement en face à face. Autorisé, mais tracé au journal.
   */
  async presentiel(patientId: string, user: AuthUser) {
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
      motif: 'Consentement présentiel attesté par l’accueil',
    });
    return consentement;
  }

  /** Révocation par l'hôpital (l'accueil reperd l'accès aux données des autres). */
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

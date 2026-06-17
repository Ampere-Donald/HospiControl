import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JournalService } from '../journal/journal.service';

type Decision = 'AUTORISE' | 'REFUSE' | 'REVOQUE';

const HOPITAL = { select: { id: true, nom: true, ville: true } };

/**
 * Bloc 1 — espace patient (portail). Le patient, authentifié par lien magique
 * (JWT rôle PATIENT), consulte son dossier, gère ses consentements et voit le
 * journal d'accès. user.id = patientId.
 */
@Injectable()
export class EspacePatientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly journal: JournalService,
  ) {}

  moi(patientId: string) {
    return this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { hopitalCreateur: HOPITAL },
    });
  }

  /** Tous les consentements du patient (par hôpital), y compris les demandes EN_ATTENTE. */
  consentements(patientId: string) {
    return this.prisma.consentement.findMany({
      where: { patientId },
      include: { hopital: HOPITAL },
      orderBy: { dateModification: 'desc' },
    });
  }

  /** Le patient décide lui-même : autoriser / refuser / révoquer un hôpital. */
  async decider(patientId: string, hopitalId: string, decision: Decision) {
    const consentement = await this.prisma.consentement.upsert({
      where: { patientId_hopitalId: { patientId, hopitalId } },
      create: { patientId, hopitalId, statut: decision },
      update: { statut: decision },
    });
    void this.journal.enregistrer({
      type:
        decision === 'AUTORISE'
          ? 'CONSENTEMENT_AUTORISE'
          : 'CONSENTEMENT_REVOQUE',
      patientId,
      hopitalId,
      acteurEstPatient: true,
    });
    return consentement;
  }

  /** Le journal d'accès du patient (modèle Estonie : « qui a consulté mon dossier »). */
  journalAcces(patientId: string) {
    return this.journal.pourPatient(patientId);
  }
}

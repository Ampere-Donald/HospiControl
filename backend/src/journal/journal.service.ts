import { Injectable } from '@nestjs/common';
import { TypeAcces } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface EnregistrerParams {
  type: TypeAcces;
  patientId: string;
  hopitalId?: string | null;
  acteurUtilisateurId?: string | null;
  acteurEstPatient?: boolean;
  motif?: string;
}

const RESUME = {
  patient: { select: { id: true, nom: true, prenom: true, telephone: true } },
  hopital: { select: { id: true, nom: true } },
  acteurUtilisateur: { select: { id: true, nom: true, prenom: true, role: true } },
};

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  /** Enregistre une entrée. N'échoue jamais : le journal ne doit pas casser une opération métier. */
  async enregistrer(p: EnregistrerParams) {
    try {
      await this.prisma.journalAcces.create({
        data: {
          type: p.type,
          patientId: p.patientId,
          hopitalId: p.hopitalId ?? undefined,
          acteurUtilisateurId: p.acteurUtilisateurId ?? undefined,
          acteurEstPatient: p.acteurEstPatient ?? false,
          motif: p.motif,
        },
      });
    } catch {
      /* on ignore : la traçabilité est secondaire face à l'acte clinique */
    }
  }

  pourPatient(patientId: string) {
    return this.prisma.journalAcces.findMany({
      where: { patientId },
      include: RESUME,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  plateforme() {
    return this.prisma.journalAcces.findMany({
      include: RESUME,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}

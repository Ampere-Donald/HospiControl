import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../common/auth-user';

/**
 * Agrégats du tableau de bord, calculés pour l'hôpital de l'utilisateur connecté.
 * Tout ce qui est « propre à l'hôpital » est filtré par hopitalId (issu du token).
 */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private hopitalDe(user: AuthUser): string {
    if (!user.hopitalId) {
      throw new ForbiddenException(
        "Votre compte n'est rattaché à aucun hôpital.",
      );
    }
    return user.hopitalId;
  }

  async resume(user: AuthUser) {
    const hopitalId = this.hopitalDe(user);
    const debutJour = new Date();
    debutJour.setHours(0, 0, 0, 0);

    const [
      totalPatients,
      consultations,
      consultationsAujourdhui,
      prescriptions,
      consentementsActifs,
      consentementsRevoques,
      patientsRecents,
      consultationsRecentes,
      consentementsRecents,
    ] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.consultation.count({ where: { hopitalId } }),
      this.prisma.consultation.count({
        where: { hopitalId, date: { gte: debutJour } },
      }),
      this.prisma.prescription.count({
        where: { consultation: { hopitalId } },
      }),
      this.prisma.consentement.count({
        where: { hopitalId, statut: 'AUTORISE' },
      }),
      this.prisma.consentement.count({
        where: { hopitalId, statut: 'REVOQUE' },
      }),
      this.prisma.patient.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { hopitalCreateur: { select: { nom: true } } },
      }),
      this.prisma.consultation.findMany({
        where: { hopitalId },
        orderBy: { date: 'desc' },
        take: 5,
        include: {
          patient: { select: { nom: true, prenom: true, telephone: true } },
        },
      }),
      this.prisma.consentement.findMany({
        where: { hopitalId },
        orderBy: { dateModification: 'desc' },
        take: 4,
        include: {
          patient: { select: { nom: true, prenom: true, telephone: true } },
        },
      }),
    ]);

    return {
      stats: {
        totalPatients,
        consultations,
        consultationsAujourdhui,
        prescriptions,
        consentementsActifs,
        consentementsRevoques,
      },
      patientsRecents: patientsRecents.map((p) => ({
        id: p.id,
        nom: p.nom,
        prenom: p.prenom,
        telephone: p.telephone,
        origine: p.hopitalCreateur?.nom ?? null,
        createdAt: p.createdAt,
      })),
      consultationsRecentes: consultationsRecentes.map((c) => ({
        id: c.id,
        date: c.date,
        motif: c.motif,
        patient: c.patient,
      })),
      consentements: consentementsRecents.map((c) => ({
        id: c.id,
        statut: c.statut,
        dateModification: c.dateModification,
        patient: c.patient,
      })),
    };
  }
}

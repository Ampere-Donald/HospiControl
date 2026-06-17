import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /** KPIs de toute la plateforme (super admin / Vue globale). */
  async plateforme() {
    const [
      hopitaux,
      hopitauxActifs,
      patients,
      consultations,
      consentementsActifs,
    ] = await Promise.all([
      this.prisma.hopital.count(),
      this.prisma.hopital.count({ where: { actif: true } }),
      this.prisma.patient.count(),
      this.prisma.consultation.count(),
      this.prisma.consentement.count({ where: { statut: 'AUTORISE' } }),
    ]);
    return {
      hopitaux,
      hopitauxActifs,
      hopitauxInactifs: hopitaux - hopitauxActifs,
      patients,
      consultations,
      consentementsActifs,
    };
  }
}

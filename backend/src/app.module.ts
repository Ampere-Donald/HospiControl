import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { CarnetModule } from './carnet/carnet.module';
import { ConsentementsModule } from './consentements/consentements.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EspacePatientModule } from './espace-patient/espace-patient.module';
import { HopitauxModule } from './hopitaux/hopitaux.module';
import { JournalModule } from './journal/journal.module';
import { PatientsModule } from './patients/patients.module';
import { PrismaModule } from './prisma/prisma.module';
import { StatsModule } from './stats/stats.module';
import { UtilisateursModule } from './utilisateurs/utilisateurs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate-limit global : 100 requêtes / minute / IP (anti-abus).
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    HopitauxModule,
    UtilisateursModule,
    PatientsModule,
    CarnetModule,
    ConsentementsModule,
    DashboardModule,
    StatsModule,
    JournalModule,
    EspacePatientModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Limite de débit en premier (anti brute-force).
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Sécurité par défaut : authentification puis autorisation sur TOUTES les routes.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

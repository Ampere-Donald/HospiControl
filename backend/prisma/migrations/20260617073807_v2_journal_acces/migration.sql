-- CreateEnum
CREATE TYPE "TypeAcces" AS ENUM ('LECTURE_CARNET', 'DEMANDE_ACCES', 'CONSENTEMENT_AUTORISE', 'CONSENTEMENT_REVOQUE', 'ACCES_URGENCE');

-- CreateTable
CREATE TABLE "JournalAcces" (
    "id" TEXT NOT NULL,
    "type" "TypeAcces" NOT NULL,
    "patientId" TEXT NOT NULL,
    "hopitalId" TEXT,
    "acteurUtilisateurId" TEXT,
    "acteurEstPatient" BOOLEAN NOT NULL DEFAULT false,
    "motif" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalAcces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JournalAcces_patientId_idx" ON "JournalAcces"("patientId");

-- CreateIndex
CREATE INDEX "JournalAcces_createdAt_idx" ON "JournalAcces"("createdAt");

-- AddForeignKey
ALTER TABLE "JournalAcces" ADD CONSTRAINT "JournalAcces_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalAcces" ADD CONSTRAINT "JournalAcces_hopitalId_fkey" FOREIGN KEY ("hopitalId") REFERENCES "Hopital"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalAcces" ADD CONSTRAINT "JournalAcces_acteurUtilisateurId_fkey" FOREIGN KEY ("acteurUtilisateurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

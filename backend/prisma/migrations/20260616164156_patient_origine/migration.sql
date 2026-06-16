-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "hopitalCreateurId" TEXT;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_hopitalCreateurId_fkey" FOREIGN KEY ("hopitalCreateurId") REFERENCES "Hopital"("id") ON DELETE SET NULL ON UPDATE CASCADE;

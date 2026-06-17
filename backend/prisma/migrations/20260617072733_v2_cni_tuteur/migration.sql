-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "cni" TEXT,
ADD COLUMN     "tuteurId" TEXT;

-- CreateIndex
CREATE INDEX "Patient_cni_idx" ON "Patient"("cni");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_tuteurId_fkey" FOREIGN KEY ("tuteurId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

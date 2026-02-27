/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `Supplier` table. All the data in the column will be lost.
  - Added the required column `leadTime` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moq` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specs` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gstNumber` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leadTimeDays` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlyCapacity` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moq` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responseTimeHr` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workforceSize` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `yearEstablished` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'LIVE', 'REJECTED', 'DELISTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SupplierStatus" ADD VALUE 'UNDER_REVIEW';
ALTER TYPE "SupplierStatus" ADD VALUE 'CONDITIONAL';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "leadTime" INTEGER NOT NULL,
ADD COLUMN     "moq" INTEGER NOT NULL,
ADD COLUMN     "specs" JSONB NOT NULL,
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "createdAt",
DROP COLUMN "data",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "gstNumber" TEXT NOT NULL,
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "leadTimeDays" INTEGER NOT NULL,
ADD COLUMN     "monthlyCapacity" INTEGER NOT NULL,
ADD COLUMN     "moq" INTEGER NOT NULL,
ADD COLUMN     "responseTimeHr" INTEGER NOT NULL,
ADD COLUMN     "trustScore" INTEGER,
ADD COLUMN     "workforceSize" INTEGER NOT NULL,
ADD COLUMN     "yearEstablished" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

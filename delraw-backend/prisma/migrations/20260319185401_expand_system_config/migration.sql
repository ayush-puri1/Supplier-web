-- AlterTable
ALTER TABLE "SystemConfig" ADD COLUMN     "allowNewRegistrations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxProductsPerSupplier" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "platformName" TEXT NOT NULL DEFAULT 'Delraw',
ADD COLUMN     "supplierAutoApprove" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supportEmail" TEXT NOT NULL DEFAULT 'support@delraw.com',
ADD COLUMN     "updatedBy" TEXT;

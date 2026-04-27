/*
  Warnings:

  - You are about to drop the column `legacyImages` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "fileKey" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "legacyImages";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "ProductImage";

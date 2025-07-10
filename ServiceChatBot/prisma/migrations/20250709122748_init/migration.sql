/*
  Warnings:

  - You are about to drop the column `uploadedBy` on the `documents` table. All the data in the column will be lost.
  - Added the required column `uploader` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "documents" DROP COLUMN "uploadedBy",
ADD COLUMN     "uploader" INTEGER NOT NULL;

/*
  Warnings:

  - Added the required column `contactAddress` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactType` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Track` ADD COLUMN `contactAddress` VARCHAR(191) NOT NULL,
    ADD COLUMN `contactType` VARCHAR(191) NOT NULL;

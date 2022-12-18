/*
  Warnings:

  - Added the required column `lastCheckTime` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Track` ADD COLUMN `lastCheckTime` DATETIME(3) NOT NULL;

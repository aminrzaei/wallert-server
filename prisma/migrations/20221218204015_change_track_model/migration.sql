/*
  Warnings:

  - You are about to drop the column `city` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `lastPostTime` on the `Track` table. All the data in the column will be lost.
  - Added the required column `lastPostToken` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Track` DROP COLUMN `city`,
    DROP COLUMN `lastPostTime`,
    ADD COLUMN `lastPostToken` VARCHAR(191) NOT NULL;

/*
  Warnings:

  - You are about to drop the column `contactType` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Contact` DROP FOREIGN KEY `Contact_userId_fkey`;

-- AlterTable
ALTER TABLE `Track` DROP COLUMN `contactType`;

-- DropTable
DROP TABLE `Contact`;

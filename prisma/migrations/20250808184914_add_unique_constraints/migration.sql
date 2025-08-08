/*
  Warnings:

  - You are about to drop the column `casinoGameId` on the `GameResult` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `GameResult` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `GameResult` table. All the data in the column will be lost.
  - You are about to drop the column `settledAt` on the `GameResult` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `GameResult` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `CasinoGame` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[api_name]` on the table `CasinoGame` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[external_id]` on the table `GameResult` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `casino_game_id` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data_raw` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `external_id` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `settled_at` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `started_at` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_amount` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_winners` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `GameResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winners` to the `GameResult` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."GameResult" DROP CONSTRAINT "GameResult_casinoGameId_fkey";

-- AlterTable
ALTER TABLE "public"."GameResult" DROP COLUMN "casinoGameId",
DROP COLUMN "createdAt",
DROP COLUMN "externalId",
DROP COLUMN "settledAt",
DROP COLUMN "startedAt",
ADD COLUMN     "casino_game_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "data_raw" JSONB NOT NULL,
ADD COLUMN     "external_id" TEXT NOT NULL,
ADD COLUMN     "settled_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "started_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "total_amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "total_winners" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "winners" JSONB NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CasinoGame_name_key" ON "public"."CasinoGame"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CasinoGame_api_name_key" ON "public"."CasinoGame"("api_name");

-- CreateIndex
CREATE UNIQUE INDEX "GameResult_external_id_key" ON "public"."GameResult"("external_id");

-- AddForeignKey
ALTER TABLE "public"."GameResult" ADD CONSTRAINT "GameResult_casino_game_id_fkey" FOREIGN KEY ("casino_game_id") REFERENCES "public"."CasinoGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

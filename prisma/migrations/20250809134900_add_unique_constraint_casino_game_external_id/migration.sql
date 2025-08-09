/*
  Warnings:

  - A unique constraint covering the columns `[casino_game_id,external_id]` on the table `GameResult` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GameResult_casino_game_id_external_id_key" ON "public"."GameResult"("casino_game_id", "external_id");

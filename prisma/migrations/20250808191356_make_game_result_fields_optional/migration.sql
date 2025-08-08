-- AlterTable
ALTER TABLE "public"."GameResult" ALTER COLUMN "total_amount" DROP NOT NULL,
ALTER COLUMN "total_winners" DROP NOT NULL,
ALTER COLUMN "winners" DROP NOT NULL;

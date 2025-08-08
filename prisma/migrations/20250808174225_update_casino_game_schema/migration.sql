-- CreateTable
CREATE TABLE "CasinoGame" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "api_name" TEXT NOT NULL,
    "logo" TEXT,
    "category" TEXT NOT NULL,
    "rtp" TEXT,
    "max_win" DOUBLE PRECISION,
    "min_stake" DOUBLE PRECISION,
    "max_take" DOUBLE PRECISION,
    "release_date" TEXT,
    "provider" TEXT,
    "features" JSONB DEFAULT '[]',
    "is_new" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasinoGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameResult" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "settledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "casinoGameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameResult" ADD CONSTRAINT "GameResult_casinoGameId_fkey" FOREIGN KEY ("casinoGameId") REFERENCES "CasinoGame"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

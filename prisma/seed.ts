import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface GameData {
    name: string;
    apiName: string;
    logo?: string;
    provider?: string;
    description?: string;
    category: string;
    is_new: boolean;
    release_date?: string;
    rtp?: string;
    features?: string[];
    fetch_url?: string;
}

async function main() {
    console.log("🌱 Starting database seed...");

    // Read the games.json file
    const gamesPath = path.join(__dirname, "..", "src", "payload", "games.json");
    const gamesData: GameData[] = JSON.parse(fs.readFileSync(gamesPath, "utf8"));

    console.log(`📊 Found ${gamesData.length} games to seed`);

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("🗑️  Clearing existing CasinoGame data...");
    await prisma.casinoGame.deleteMany({});

    // Insert the games
    let createdCount = 0;
    for (const gameData of gamesData) {
        try {
            await prisma.casinoGame.create({
                data: {
                    name: gameData.name,
                    api_name: gameData.apiName, // Map apiName to api_name
                    logo: gameData.logo || null,
                    provider: gameData.provider || null,
                    description: gameData.description || null,
                    category: gameData.category,
                    is_new: gameData.is_new,
                    release_date: gameData.release_date || null,
                    rtp: gameData.rtp || null,
                    features: gameData.features || [],
                    fetch_results_url: gameData.fetch_url || null // Map fetch_url to fetch_results_url
                }
            });
            createdCount++;
            console.log(`✅ Created game: ${gameData.name} (${gameData.apiName})`);
        } catch (error) {
            console.error(`❌ Failed to create game ${gameData.name}:`, error);
        }
    }

    console.log(`🎉 Successfully seeded ${createdCount} games!`);
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

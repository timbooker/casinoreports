import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

const GAME_CONFIGS = [
  {
    apiName: 'sweetbonanzacandyland',
    url: 'https://api.casinoscores.com/svc-evolution-game-events/api/sweetbonanza?page=0&size=25&sort=data.settledAt,desc&duration=6&wheelResults=1,2,5,Bubble%20Surprise,Candy%20Drop,Sweet%20Spins&isSugarbomb=true,false',
    take: 25,
  },
  {
    apiName: 'treasureisland',
    url: 'https://api.casinoscores.com/svc-evolution-game-events/api/treasureisland?page=0&size=25&sort=data.settledAt,desc&duration=30&wheelResults=1,2,5,10,Ben%27s%20Lost%20Marbles,John%20Silver%27s%20Loot,Billy%20Bones%27%20Map,Captain%20Flint%27s%20Treasure&isTopSlotMatched=true,false',
    take: 25,
  },
  {
    apiName: 'monopoly',
    url: 'https://api.casinoscores.com/svc-evolution-game-events/api/monopoly?page=0&size=25&sort=data.settledAt,desc&duration=6&wheelResults=1,2,5,10,2r,4r,ch',
    take: 25,
  },
  {
    apiName: 'lightningstorm',
    url: 'https://api.casinoscores.com/svc-evolution-game-events/api/lightningstorm?page=0&size=25&sort=data.settledAt,desc&duration=6&wheelResults=StormBonus,Fireball,MonsterMash,HotSpot,BatteryCharger,EvoLeaf',
    take: 25,
  },
  {
    apiName: 'abwonderland',
    url: 'https://api.casinoscores.com/svc-evolution-game-events/api/abwonderland?page=0&size=25&sort=data.settledAt,desc&duration=6&wheelResults=ABW_WONDERSPINS_5,ABW_WOLTERSPINS,ABW_WONDERSPINS_2,ABW_MAGIC_DICE,ABW_10,ABW_5,ABW_2,ABW_1,ABW_CARD_SOLDIERS',
    take: 25,
  },
  {
    apiName: 'bigballer',
    url: 'https://api.casinoscores.com/svc-evolution-game-events/api/bigballer?page=0&size=25&sort=data.settledAt,desc&duration=6&isThreeRolls=true,false&isFiveRolls=true,false',
    take: 25,
  },
];

async function syncGameResults() {
  for (const game of GAME_CONFIGS) {
    try {
      const casinoGame = await prisma.casinoGame.findFirst({ where: { apiName: game.apiName } });
      if (!casinoGame) {
        console.warn(`CasinoGame not found for apiName: ${game.apiName}`);
        continue;
      }
      const { data } = await axios.get(game.url);
      for (const result of data) {
        // Find or create GameResult by externalId and casinoGameId
        let gameResult = await prisma.gameResult.findFirst({
          where: { externalId: result.id, casinoGameId: casinoGame.id },
        });
        
        const resultData = {
          externalId: result.id,
          startedAt: new Date(result.data.startedAt),
          settledAt: new Date(result.data.settledAt),
          status: result.data.status,
          result: result.data.result || {},
          casinoGameId: casinoGame.id,
        };

        if (!gameResult) {
          gameResult = await prisma.gameResult.create({
            data: resultData,
          });
        } else {
          gameResult = await prisma.gameResult.update({
            where: { id: gameResult.id },
            data: resultData,
          });
        }
      }
    } catch (err) {
      console.error(`Error syncing results for ${game.apiName}:`, err);
    }
  }
}

// Run every minute
setInterval(syncGameResults, 60 * 1000);

// Run immediately on start
syncGameResults(); 
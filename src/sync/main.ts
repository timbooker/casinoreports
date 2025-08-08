import { syncGameResults } from "./sync-game-results";

syncGameResults();

setInterval(syncGameResults, 60 * 1000); // Run every minute

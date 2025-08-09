export const CASINO_SCORE_BASE_URL = "https://api.casinoscores.com";

export const CASINO_SCORE_GAME_EVENTS_BASE_URL = `${CASINO_SCORE_BASE_URL}/svc-evolution-game-events/api`;
export const CASINO_GAME_SIMULATOR_BASE_URL = `${CASINO_SCORE_BASE_URL}/cg-neptune-game-show-simulator/api/simulator`;

export const CommonHeaders = {
    ["User-Agent"]: "casino-tracker/0.1.0",
    ["Accept"]: "application/json",
    ["Content-Type"]: "application/json"
};

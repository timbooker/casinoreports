export const CASINO_SCORE_BASE_URL = "https://api.casinoscores.com";

export const CASINO_SCORE_GAME_EVENTS_BASE_URL = `${CASINO_SCORE_BASE_URL}/svc-evolution-game-events/api`;
export const CASINO_GAME_SIMULATOR_BASE_URL = `${CASINO_SCORE_BASE_URL}/cg-neptune-game-show-simulator/api/simulator`;

export const CommonHeaders = {
    ["Accept"]: "application/json, text/plain, */*",
    ["Accept-Language"]: "en-US,en;q=0.9",
    ["Accept-Encoding"]: "gzip, deflate, br",
    ["User-Agent"]:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ["Referer"]: "https://casinoscores.com/",
    ["Origin"]: "https://casinoscores.com",
    ["Sec-Fetch-Dest"]: "empty",
    ["Sec-Fetch-Mode"]: "cors",
    ["Sec-Fetch-Site"]: "same-site",
    ["Cache-Control"]: "no-cache",
    ["Pragma"]: "no-cache"
};

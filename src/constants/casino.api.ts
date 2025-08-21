import { HttpsProxyAgent } from "https-proxy-agent";
import axios from "axios";

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

export const BRIGHT_DATA_RESIDENTIAL_PROXY_CONFIG = {
    username: process.env.BRIGHT_DATA_USERNAME!,
    password: process.env.BRIGHT_DATA_PASSWORD!,
    host: process.env.BRIGHT_DATA_HOST!,
    port: parseInt(process.env.BRIGHT_DATA_PORT!),
    country: process.env.BRIGHT_DATA_COUNTRY || "us"
};

export function createBrightDataAxiosInstance() {
    const sessionId = Math.random().toString(36).substring(7);

    const proxyUrl = `http://${BRIGHT_DATA_RESIDENTIAL_PROXY_CONFIG.username}-country-${BRIGHT_DATA_RESIDENTIAL_PROXY_CONFIG.country}-session-${sessionId}:${BRIGHT_DATA_RESIDENTIAL_PROXY_CONFIG.password}@${BRIGHT_DATA_RESIDENTIAL_PROXY_CONFIG.host}:${BRIGHT_DATA_RESIDENTIAL_PROXY_CONFIG.port}`;

    const agent = new HttpsProxyAgent(proxyUrl);

    return axios.create({
        httpsAgent: agent,
        timeout: 30000,
        headers: CommonHeaders
    });
}

export function createBrightDataAxiosInstanceWithCountry(country: string) {
    const sessionId = Math.random().toString(36).substring(7);

    const proxyUrl = `http://${BRIGHT_DATA_RESIDENTIAL_PROXY_CONFIG.username}-country-${country}-session-${sessionId}:${BRIGHT_DATA_RESIDENTIAL_PROXY_CONFIG.password}@${BRIGHT_DATA_RESIDENTIAL_PROXY_CONFIG.host}:${BRIGHT_DATA_RESIDENTIAL_PROXY_CONFIG.port}`;

    const agent = new HttpsProxyAgent(proxyUrl);

    return axios.create({
        httpsAgent: agent,
        timeout: 30000,
        headers: CommonHeaders
    });
}

export function createBrightDataAxiosInstanceWithRandomCountry() {
    const countries = ["us", "gb", "de", "fr", "ca", "au", "nl", "se", "no", "dk"];
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];

    return createBrightDataAxiosInstanceWithCountry(randomCountry);
}

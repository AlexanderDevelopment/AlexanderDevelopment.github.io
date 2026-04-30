import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataFile = path.join(rootDir, "data", "steam-games.json");
const fallbackAppIds = ["3215820", "4454760", "4635170"];
const source = "https://store.steampowered.com/api/appdetails?filters=basic";

async function readCurrentData() {
  try {
    const raw = await readFile(dataFile, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return { games: {} };
    }

    throw error;
  }
}

function getAppIds(currentData) {
  const configuredIds = Object.keys(currentData.games || {});
  return configuredIds.length ? configuredIds : fallbackAppIds;
}

function areGamesEqual(currentGames, nextGames) {
  const currentKeys = Object.keys(currentGames || {}).sort();
  const nextKeys = Object.keys(nextGames || {}).sort();

  if (currentKeys.length !== nextKeys.length) {
    return false;
  }

  for (let index = 0; index < currentKeys.length; index += 1) {
    const appId = currentKeys[index];

    if (appId !== nextKeys[index]) {
      return false;
    }

    const currentGame = currentGames[appId] || {};
    const nextGame = nextGames[appId] || {};

    if (currentGame.name !== nextGame.name || currentGame.headerImage !== nextGame.headerImage) {
      return false;
    }
  }

  return true;
}

function isSteamStaticImage(value, appId) {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      /(^|\.)steamstatic\.com$/i.test(url.hostname) &&
      url.pathname.includes(`/apps/${appId}/`) &&
      /\.(avif|jpe?g|png|webp)$/i.test(url.pathname)
    );
  } catch {
    return false;
  }
}

async function fetchSteamApp(appId) {
  const url = `https://store.steampowered.com/api/appdetails?appids=${encodeURIComponent(appId)}&filters=basic`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "ZweiBier-Indie-Site-Artwork-Updater/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Steam request for ${appId} failed with ${response.status}`);
  }

  const payload = await response.json();
  const entry = payload && payload[appId];

  if (!entry || entry.success !== true || !entry.data) {
    throw new Error(`Steam did not return app data for ${appId}`);
  }

  const name = entry.data.name;
  const headerImage = entry.data.header_image;

  if (!isSteamStaticImage(headerImage, appId)) {
    throw new Error(`Steam returned an invalid header image for ${appId}`);
  }

  return {
    name: typeof name === "string" && name.trim() ? name.trim() : appId,
    headerImage
  };
}

async function main() {
  const currentData = await readCurrentData();
  const appIds = getAppIds(currentData);
  const games = {};

  for (const appId of appIds) {
    games[appId] = await fetchSteamApp(appId);
  }

  if (currentData.source === source && areGamesEqual(currentData.games, games)) {
    console.log("Steam artwork cache is already up to date.");
    return;
  }

  const nextData = {
    updatedAt: new Date().toISOString(),
    source,
    games
  };

  await mkdir(path.dirname(dataFile), { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(nextData, null, 2)}\n`, "utf8");

  console.log(`Updated Steam artwork for ${appIds.length} apps.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

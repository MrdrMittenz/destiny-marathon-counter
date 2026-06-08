require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const BUNGIE_API_KEY = process.env.BUNGIE_API_KEY || '';

const D2_APPID = 1085660;
const MARA_APPID = 3065800;

const RAIDS = [
  { hash: 2693136602, name: 'Leviathan', release: '2017-09-13', players: 6, location: 'Nessus', sunset: true, guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+leviathan+raid+guide+2024', reportUrl: 'https://raid.report', description: 'Enter the massive Cabal ship above Nessus to prove your worth to Emperor Calus in the first Destiny 2 raid.' },
  { hash: 2713176739, name: 'Eater of Worlds', release: '2017-12-05', players: 6, location: 'Nessus', sunset: true, guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+eater+of+worlds+raid+guide', reportUrl: 'https://raid.report', description: 'Descend into the depths of Nessus to stop a Vex mind from consuming a world.' },
  { hash: 2157261382, name: 'Spire of Stars', release: '2018-05-08', players: 6, location: 'Nessus', sunset: true, guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+spire+of+stars+raid+guide', reportUrl: 'https://raid.report', description: 'Climb the Spire of Stars and confront Val Ca\'uor, champion of the Red Legion.' },
  { hash: 3174972356, name: 'Last Wish', release: '2018-09-14', players: 6, location: 'Dreaming City', sunset: false, guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+last+wish+raid+guide+2024', reportUrl: 'https://raid.report', description: 'Enter the Dreaming City to slay Riven, the last Ahamkara, in Destiny\'s most complex raid.' },
  { hash: 1661733210, name: 'Scourge of the Past', release: '2018-12-07', players: 6, location: 'EDZ', sunset: true, guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+scourge+of+the+past+raid+guide', reportUrl: 'https://raid.report', description: 'Infiltrate a Fallen stronghold beneath the EDZ to stop their new mechanical threat.' },
  { hash: 1772847445, name: 'Crown of Sorrow', release: '2019-06-04', players: 6, location: 'Moon', sunset: true, guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+crown+of+sorrow+raid+guide', reportUrl: 'https://raid.report', description: 'Enter the Scarlet Keep to sever Calus\'s connection to the Hive worm Gods.' },
  { hash: 2448933663, name: 'Garden of Salvation', release: '2019-10-05', players: 6, location: 'Black Garden', sunset: false, guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+garden+of+salvation+raid+guide', reportUrl: 'https://raid.report', description: 'Venture into the Black Garden to stop the Sol Divisive Vex from communing with the Darkness.' },
  { hash: 1374392663, name: 'Deep Stone Crypt', release: '2020-11-21', players: 6, location: 'Europa', sunset: false, guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+deep+stone+crypt+raid+guide', reportUrl: 'https://raid.report', description: 'Infiltrate the Deep Stone Crypt on Europa to put an end to Clovis Bray\'s Exo program.' },
  { hash: 3883806472, name: 'Vault of Glass', release: '2021-05-22', players: 6, location: 'Venus', sunset: false, guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+vault+of+glass+raid+guide', reportUrl: 'https://raid.report', description: 'Relive the classic Destiny 1 raid — enter the Vault of Glass and face the Templar and Atheon.' },
  { hash: 1941032341, name: 'Vow of the Disciple', release: '2022-03-05', players: 6, location: 'Savathûn\'s Throne World', sunset: false, guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+vow+of+the+disciple+raid+guide', reportUrl: 'https://raid.report', description: 'Plunge into Savathûn\'s Pyramid ship to uncover the dark secrets of The Witness\'s first Disciple.' },
  { hash: 1084882524, name: 'King\'s Fall', release: '2022-08-26', players: 6, location: 'Dreadnaught', sunset: false, guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+king%27s+fall+raid+guide', reportUrl: 'https://raid.report', description: 'Return to the Dreadnaught and challenge Oryx, the Taken King, in this reprised Destiny 1 classic.' },
  { hash: 2388338349, name: 'Root of Nightmares', release: '2023-03-10', players: 6, location: 'Terraformed Pyramid', sunset: false, guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+root+of+nightmares+raid+guide', reportUrl: 'https://raid.report', description: 'Climb the Root of Nightmares within a pyramid ship and face the forces of the Witness.' },
  { hash: 3536755877, name: 'Crota\'s End', release: '2023-09-01', players: 6, location: 'Moon', sunset: false, guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+crota%27s+end+raid+guide', reportUrl: 'https://raid.report', description: 'Return to the Hellmouth to challenge Crota, Son of Oryx, in this reprised Destiny 1 raid.' },
  { hash: 2071866889, name: 'Salvation\'s Edge', release: '2024-06-07', players: 6, location: 'The Traveler', sunset: false, guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+salvation%27s+edge+raid+guide', reportUrl: 'https://raid.report', description: 'Climb the Traveler itself in the final raid — face The Witness in the ultimate showdown.' },
];

const DUNGEONS = [
  { hash: 3744337655, name: 'Shattered Throne', release: '2018-09-25', players: 3, location: 'Dreaming City', guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+shattered+throne+dungeon+guide', reportUrl: 'https://dungeon.report', description: 'Venture into the Dreaming City\'s darkest corner to defeat the corrupted Awoken, Dul Incaru.' },
  { hash: 3848504915, name: 'Pit of Heresy', release: '2019-10-29', players: 3, location: 'Moon', guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+pit+of+heresy+dungeon+guide', reportUrl: 'https://dungeon.report', description: 'Descend into the Moon\'s depths to stop a Hive ritual and claim powerful rewards.' },
  { hash: 2503595315, name: 'Prophecy', release: '2020-06-09', players: 3, location: 'The Nine\'s Realm', guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+prophecy+dungeon+guide', reportUrl: 'https://dungeon.report', description: 'Navigate the mysterious realms of the Nine in this visually stunning dungeon.' },
  { hash: 3172982466, name: 'Grasp of Avarice', release: '2021-12-07', players: 3, location: 'Cosmodrome', guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+grasp+of+avarice+dungeon+guide', reportUrl: 'https://dungeon.report', description: 'Enter the Loot Cave legend to recover Avarice\'s lost treasure from a hoard of Fallen.' },
  { hash: 3854642673, name: 'Duality', release: '2022-05-27', players: 3, location: 'Calus\'s Mindscape', guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+duality+dungeon+guide', reportUrl: 'https://dungeon.report', description: 'Journey through Calus\'s memories and face the nightmares of his past.' },
  { hash: 3643198760, name: 'Spire of the Watcher', release: '2022-12-09', players: 3, location: 'Mars', guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+spire+of+the+watcher+dungeon+guide', reportUrl: 'https://dungeon.report', description: 'Climb the Spire on Mars and reactivate Rasputin\'s dormant defenses.' },
  { hash: 2284288495, name: 'Ghosts of the Deep', release: '2023-05-26', players: 3, location: 'Titan', guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+ghosts+of+the+deep+dungeon+guide', reportUrl: 'https://dungeon.report', description: 'Descend into the methane seas of Titan to put the Lucent Hive\'s ghosts to rest.' },
  { hash: 1460038811, name: 'Warlord\'s Ruin', release: '2023-12-06', players: 3, location: 'EDZ', guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+warlord%27s+ruin+dungeon+guide', reportUrl: 'https://dungeon.report', description: 'Storm a Warlord\'s fortress in the EDZ to break a Scorn curse.' },
  { hash: 190162744, name: 'Vesper\'s Host', release: '2024-10-11', players: 3, location: 'Europa', guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+vesper%27s+host+dungeon+guide', reportUrl: 'https://dungeon.report', description: 'Explore the mysterious Vesper Station on Europa and uncover its dark secrets.' },
  { hash: 1734724484, name: 'Sundered Doctrine', release: '2025-02-07', players: 3, location: 'Savathûn\'s Throne World', guideUrl: 'https://www.youtube.com/results?search_query=destiny+2+sundered+doctrine+dungeon+guide', reportUrl: 'https://dungeon.report', description: 'Descend into the Rhulk\'s shattered pyramid to uncover forbidden knowledge.' },
];

const D2_TIMELINE = [
  { date: '2014-09-09', event: 'Destiny launches — the journey begins.' },
  { date: '2015-09-15', event: 'The Taken King — Oryx arrives.' },
  { date: '2017-09-06', event: 'Destiny 2 launches — Red War begins.' },
  { date: '2017-12-05', event: 'Curse of Osiris — first expansion.' },
  { date: '2018-05-08', event: 'Warmind — Rasputin awakens.' },
  { date: '2018-09-04', event: 'Forsaken — vengeance in the Reef.' },
  { date: '2019-10-01', event: 'Shadowkeep — nightmares on the Moon.' },
  { date: '2020-11-10', event: 'Beyond Light — Darkness arrives.' },
  { date: '2021-02-09', event: 'Season of the Chosen — Cabal armistice.' },
  { date: '2021-08-24', event: 'Season of the Lost — Mara Sov returns.' },
  { date: '2022-02-22', event: 'The Witch Queen — deception unveiled.' },
  { date: '2023-03-03', event: 'Lightfall — the Witness arrives.' },
  { date: '2024-06-04', event: 'The Final Shape — the end of the Light and Darkness saga.' },
  { date: '2026-06-09', event: 'Destiny 2 content updates conclude. The journey ends.' },
];

const DATA_DIR = path.join(__dirname, 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'player-history.json');
const GUESTBOOK_FILE = path.join(DATA_DIR, 'guestbook.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let guestbook = [];
function loadGuestbook() {
  try { if (fs.existsSync(GUESTBOOK_FILE)) guestbook = JSON.parse(fs.readFileSync(GUESTBOOK_FILE, 'utf8')) || []; } catch { guestbook = []; }
}
function saveGuestbook() { try { fs.writeFileSync(GUESTBOOK_FILE, JSON.stringify(guestbook.slice(-200))); } catch {} }
loadGuestbook();

let currentPlayers = { destiny2: null, marathon: null, timestamp: null };
let playerHistory = [];
let collectionActive = false;

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const raw = fs.readFileSync(HISTORY_FILE, 'utf8');
      playerHistory = JSON.parse(raw);
      if (!Array.isArray(playerHistory)) playerHistory = [];
    }
  } catch (e) {
    playerHistory = [];
  }
}

function saveHistory() {
  try {
    const maxEntries = 100000;
    if (playerHistory.length > maxEntries) {
      playerHistory = playerHistory.slice(-maxEntries);
    }
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(playerHistory));
  } catch (e) {
    console.error('Failed to save history:', e.message);
  }
}

loadHistory();
console.log(`Loaded ${playerHistory.length} historical data points`);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

async function fetchSteamPlayerCount(appId) {
  const url = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}`;
  const res = await axios.get(url, { timeout: 10000 });
  return res.data.response.player_count;
}

async function collectPlayerData() {
  try {
    const [d2, mara] = await Promise.all([
      fetchSteamPlayerCount(D2_APPID),
      fetchSteamPlayerCount(MARA_APPID)
    ]);

    currentPlayers = { destiny2: d2, marathon: mara, timestamp: Date.now() };

    const entry = { t: Date.now(), d2, mara };
    playerHistory.push(entry);
    saveHistory();

    if (playerHistory.length % 100 === 0) {
      console.log(`Collected ${playerHistory.length} data points — D2: ${d2}, Marathon: ${mara}`);
    }
  } catch (err) {
    console.error('Collection error:', err.message);
  }
}

function startCollector() {
  if (collectionActive) return;
  collectionActive = true;
  collectPlayerData();
  setInterval(collectPlayerData, 15000);
}

startCollector();

function getStats() {
  const now = Date.now();
  const day24h = 24 * 60 * 60 * 1000;
  const recentData = playerHistory.filter(e => (now - e.t) < day24h);
  const allTimeData = playerHistory;

  function compute(entries, key) {
    if (entries.length === 0) return { current: null, peak: null, min: null, avg: null, peakTime: null };
    const values = entries.map(e => e[key]).filter(v => v !== null && v !== undefined);
    if (values.length === 0) return { current: null, peak: null, min: null, avg: null, peakTime: null };
    const peak = Math.max(...values);
    const min = Math.min(...values);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const peakEntry = entries.find(e => e[key] === peak);
    return { current: values[values.length - 1], peak, min, avg, peakTime: peakEntry ? peakEntry.t : null };
  }

  return {
    destiny2: {
      current: currentPlayers.destiny2,
      ...compute(allTimeData, 'd2'),
      last24h: compute(recentData, 'd2')
    },
    marathon: {
      current: currentPlayers.marathon,
      ...compute(allTimeData, 'mara'),
      last24h: compute(recentData, 'mara')
    },
    totalSamples: playerHistory.length,
    collectingSince: playerHistory.length > 0 ? playerHistory[0].t : null
  };
}

app.get('/api/players', (req, res) => {
  res.json({
    destiny2: currentPlayers.destiny2,
    marathon: currentPlayers.marathon,
    timestamp: currentPlayers.timestamp
  });
});

app.get('/api/players/history', (req, res) => {
  const range = req.query.range || '24h';
  const now = Date.now();
  let cutoff = now - 24 * 60 * 60 * 1000;

  if (range === '7d') cutoff = now - 7 * 24 * 60 * 60 * 1000;
  else if (range === '30d') cutoff = now - 30 * 24 * 60 * 60 * 1000;
  else if (range === 'all') cutoff = 0;

  const filtered = playerHistory.filter(e => e.t >= cutoff);
  res.json({ range, count: filtered.length, data: filtered });
});

app.get('/api/players/stats', (req, res) => {
  res.json(getStats());
});

async function bungieApiGet(endpoint) {
  if (!BUNGIE_API_KEY) {
    throw new Error('BUNGIE_API_KEY not configured');
  }
  const url = `https://www.bungie.net/Platform${endpoint}`;
  const res = await axios.get(url, {
    headers: {
      'X-API-Key': BUNGIE_API_KEY,
      'Accept': 'application/json'
    },
    timeout: 15000
  });
  return res.data;
}

async function fetchGlobalStats() {
  try {
    const milestones = await bungieApiGet('/Destiny2/Milestones/');
    const items = await bungieApiGet('/ Destiny2/Armory/');
    return { milestones: milestones.Response, items: items.Response };
  } catch (e) {
    throw e;
  }
}

const BUNGIE_CACHE = {};
const CACHE_TTL = 5 * 60 * 1000;

async function fetchWithCache(endpoint, ttlMs = CACHE_TTL) {
  const now = Date.now();
  if (BUNGIE_CACHE[endpoint] && (now - BUNGIE_CACHE[endpoint].fetched) < ttlMs) {
    return BUNGIE_CACHE[endpoint].data;
  }
  const data = await bungieApiGet(endpoint);
  BUNGIE_CACHE[endpoint] = { data, fetched: now };
  return data;
}

app.get('/api/destiny/milestones', async (req, res) => {
  try {
    const data = await fetchWithCache('/Destiny2/Milestones/', 120000);
    const milestones = data.Response || {};

    const withNames = {};
    for (const [key, ms] of Object.entries(milestones)) {
      let name = `Milestone ${ms.milestoneHash}`;
      try {
        const def = await fetchWithCache(
          `/Destiny2/Manifest/DestinyMilestoneDefinition/${ms.milestoneHash}/`,
          3600000
        );
        if (def.Response?.displayProperties?.name) {
          name = def.Response.displayProperties.name;
        }
      } catch (e) {}

      const actPromises = (ms.activities || []).map(async (a) => {
        let actName = `Activity ${a.activityHash}`;
        try {
          const def = await fetchWithCache(
            `/Destiny2/Manifest/DestinyActivityDefinition/${a.activityHash}/`,
            3600000
          );
          if (def.Response?.displayProperties?.name) {
            actName = def.Response.displayProperties.name;
          }
        } catch (e) {}
        return { ...a, name: actName };
      });

      const activities = await Promise.all(actPromises);
      withNames[key] = { ...ms, name, activities };
    }

    res.json({ Response: withNames });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/destiny/manifest', async (req, res) => {
  try {
    const data = await fetchWithCache('/Destiny2/Manifest/', 3600000);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/destiny/clan/:groupId', async (req, res) => {
  try {
    const data = await fetchWithCache(`/GroupV2/${req.params.groupId}/`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/destiny/profile/:membershipType/:membershipId', async (req, res) => {
  try {
    const { membershipType, membershipId } = req.params;
    const components = req.query.components || '100,200,300,400,900';
    const data = await fetchWithCache(
      `/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`,
      30000
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/destiny/search-player/:displayName/:displayNameCode', async (req, res) => {
  try {
    const fullName = `${req.params.displayName}#${req.params.displayNameCode}`;
    const searchData = await fetchWithCache(
      `/Destiny2/SearchDestinyPlayer/-1/${encodeURIComponent(fullName)}/`,
      15000
    );
    const results = searchData.Response || [];
    if (results.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = results[0];
    const membershipType = player.membershipType;
    const membershipId = player.membershipId;

    const [profile, characters] = await Promise.all([
      fetchWithCache(
        `/Destiny2/${membershipType}/Profile/${membershipId}/?components=100`,
        30000
      ),
      fetchWithCache(
        `/Destiny2/${membershipType}/Profile/${membershipId}/?components=200`,
        30000
      )
    ]);

    res.json({
      player,
      profile,
      characters,
      bungieUser: player.bungieGlobalDisplayName
        ? { bungieNetUser: { displayName: `${player.bungieGlobalDisplayName}#${player.bungieGlobalDisplayNameCode}` } }
        : null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const ACTIVITY_TYPE_ESTIMATES = {
  raid: { share: 0.08, label: 'Raids' },
  dungeon: { share: 0.05, label: 'Dungeons' },
  nightfall: { share: 0.12, label: 'Nightfall' },
  strike: { share: 0.10, label: 'Strikes' },
  crucible: { share: 0.20, label: 'Crucible' },
  trials: { share: 0.06, label: 'Trials of Osiris' },
  ironbanner: { share: 0.12, label: 'Iron Banner' },
  gambit: { share: 0.05, label: 'Gambit' },
  seasonal: { share: 0.12, label: 'Seasonal Content' },
  openworld: { share: 0.10, label: 'Open World' },
};

const ACTIVITY_TYPE_HASHES = {
  1848252830: 'crucible',       // Control
  2385714706: 'crucible',       // Survival
  481493052: 'crucible',        // Momentum
  4063193256: 'crucible',       // Mayhem
  1532140758: 'crucible',       // Scorched
  1750743586: 'crucible',       // Rumble
  1264526655: 'crucible',       // Clash
  1228354847: 'crucible',       // Supremacy
  3852574475: 'crucible',       // Elimination
  4195653037: 'trials',         // Trials
  3723679883: 'ironbanner',     // Iron Banner
  4128386285: 'gambit',         // Gambit
  3808552394: 'gambit',         // Gambit Prime (legacy)
  3047587038: 'strike',         // Vanguard Ops
  2917545372: 'nightfall',      // Nightfall
  3506850202: 'nightfall',      // Grandmaster Nightfall
  575572995: 'raid',            // Raid
  3216041321: 'dungeon',        // Dungeon
};

function estimateActivityPopulation(d2CurrentCount) {
  const base = d2CurrentCount || 15000;
  return Object.entries(ACTIVITY_TYPE_ESTIMATES).map(([key, cfg]) => ({
    type: key,
    label: cfg.label,
    estimatedPlayers: Math.round(base * cfg.share),
    share: cfg.share
  }));
}

app.get('/api/destiny/activity-estimates', async (req, res) => {
  try {
    const d2Total = currentPlayers.destiny2 || 15000;

    const estD2 = Math.round(d2Total / 0.35);
    const estPS = Math.round(estD2 * 0.45);
    const estXbox = Math.round(estD2 * 0.20);

    const platformEstimate = {
      pc: d2Total,
      ps5: estPS,
      xbox: estXbox,
      total: estD2,
      note: 'Platform split estimated using Destiny 2 historical ratio (PC ~35%, PS ~45%, Xbox ~20%)'
    };

    const d2Only = currentPlayers.destiny2 || 0;
    const mareOnly = currentPlayers.marathon || 0;

    let activityBreakdown = estimateActivityPopulation(d2Only);

    try {
      const milData = await fetchWithCache('/Destiny2/Milestones/', 120000);
      const milestones = milData.Response || {};

      const activeTypes = new Set();
      for (const ms of Object.values(milestones)) {
        const acts = ms.activities || [];
        for (const a of acts) {
          try {
            const def = await fetchWithCache(
              `/Destiny2/Manifest/DestinyActivityDefinition/${a.activityHash}/`,
              3600000
            );
            const typeHash = def.Response?.activityTypeHash;
            let typeKey = ACTIVITY_TYPE_HASHES[typeHash];
            if (!typeKey && def.Response?.displayProperties?.name) {
              const name = def.Response.displayProperties.name.toLowerCase();
              if (name.includes('raid') || name.includes('last wish') || name.includes('garden') || name.includes('deep stone') || name.includes('vow') || name.includes('root') || name.includes('crota')) typeKey = 'raid';
              else if (name.includes('dungeon') || name.includes('prophecy') || name.includes('pit') || name.includes('shattered') || name.includes('grasp') || name.includes('duality') || name.includes('spire') || name.includes('ghost')) typeKey = 'dungeon';
              else if (name.includes('nightfall') || name.includes('gm')) typeKey = 'nightfall';
              else if (name.includes('trials')) typeKey = 'trials';
              else if (name.includes('iron banner')) typeKey = 'ironbanner';
              else if (name.includes('gambit')) typeKey = 'gambit';
              else if (name.includes('strike') || name.includes('vanguard')) typeKey = 'strike';
              else if (name.includes('crucible') || name.includes('pvp') || name.includes('control') || name.includes('survival')) typeKey = 'crucible';
              else if (name.includes('seasonal') || name.includes('season') || name.includes('event') || name.includes('festival') || name.includes('dawning') || name.includes('revelry') || name.includes('solstice')) typeKey = 'seasonal';
            }
            if (typeKey) activeTypes.add(typeKey);
          } catch (e) {}
        }
      }

      activityBreakdown = estimateActivityPopulation(d2Only);
      if (activeTypes.size > 0) {
        activityBreakdown = activityBreakdown.filter(a => activeTypes.has(a.type));
      }
    } catch (e) {}

    const d2Share = platformEstimate.total > 0 ? (d2Only / platformEstimate.total * 100) : 0;

    res.json({
      platform: platformEstimate,
      d2Steam: d2Only,
      marathonSteam: mareOnly,
      activities: activityBreakdown.sort((a, b) => b.estimatedPlayers - a.estimatedPlayers),
      d2PlatformShare: Math.round(d2Share),
      activityTypesPresent: estimateActivityPopulation(d2Only).filter(a => a.estimatedPlayers > 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/legacy/raids', (req, res) => {
  res.json({ raids: RAIDS, total: RAIDS.length });
});

app.get('/api/legacy/dungeons', (req, res) => {
  res.json({ dungeons: DUNGEONS, total: DUNGEONS.length });
});

app.get('/api/legacy/timeline', (req, res) => {
  res.json({ timeline: D2_TIMELINE });
});

app.get('/api/legacy/all', (req, res) => {
  res.json({
    raids: RAIDS,
    dungeons: DUNGEONS,
    timeline: D2_TIMELINE,
    totalRaids: RAIDS.length,
    totalDungeons: DUNGEONS.length,
    d2Launch: '2017-09-06',
    d2End: '2026-06-09',
    totalYears: '9',
    farewell: 'Thank you, Guardians. It\'s been an honor.'
  });
});

const TOP_D2_STREAMERS = [
  'Datto', 'Aztecross', 'Falloutplays', 'Gothalion', 'KackisHD',
  'Ehroar', 'Mactics', 'Coolguy', 'CammyCakes', 'Frostbolt',
  'SirDimetrious', 'Mtashed', 'Bakengansta', 'TheLegendofThunder',
  'GernaderJake', 'Wallah', 'SayNoToRage', 'Zkmushroom', 'TrueVanguard',
  'IamDavvv', 'LilSonic', 'Drewsky'
];

app.get('/api/destiny/weekly-featured', async (req, res) => {
  try {
    const milData = await fetchWithCache('/Destiny2/Milestones/', 120000);
    const milestones = Object.values(milData.Response || {});
    const featured = { raid: null, dungeon: null, activities: [] };

    for (const ms of milestones) {
      const name = ms.name || `Milestone ${ms.milestoneHash}`;
      for (const a of (ms.activities || [])) {
        try {
          let actName = `Activity ${a.activityHash}`;
          const def = await fetchWithCache(
            `/Destiny2/Manifest/DestinyActivityDefinition/${a.activityHash}/`,
            3600000
          );
          if (def.Response?.displayProperties?.name) actName = def.Response.displayProperties.name;
          const lower = actName.toLowerCase();
          const raidMatch = RAIDS.find(r => lower.includes(r.name.toLowerCase()));
          const dungeonMatch = DUNGEONS.find(d => lower.includes(d.name.toLowerCase()));
          if (raidMatch) featured.raid = raidMatch;
          if (dungeonMatch) featured.dungeon = dungeonMatch;
          featured.activities.push({ name: actName, hash: a.activityHash, milestone: name });
        } catch {}
      }
    }
    res.json(featured);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/countdown', (req, res) => {
  const now = new Date();
  const finalReset = new Date('2026-06-09T17:00:00Z');
  const diffMs = Math.max(0, finalReset - now);
  res.json({
    now: now.toISOString(),
    finalReset: finalReset.toISOString(),
    days: Math.floor(diffMs / 86400000),
    hours: Math.floor((diffMs % 86400000) / 3600000),
    minutes: Math.floor((diffMs % 3600000) / 60000),
    seconds: Math.floor((diffMs % 60000) / 1000),
    isOver: diffMs <= 0
  });
});

app.get('/api/guestbook', (req, res) => {
  res.json({ entries: guestbook.slice().reverse(), total: guestbook.length });
});

app.post('/api/guestbook', (req, res) => {
  const { name, message } = req.body;
  if (!name || !message || name.length > 30 || message.length > 500) {
    return res.status(400).json({ error: 'Name (max 30) and message (max 500) required' });
  }
  const entry = { id: Date.now(), name: name.trim(), message: message.trim(), time: Date.now() };
  guestbook.push(entry);
  saveGuestbook();
  res.json({ success: true, entry });
});

app.get('/api/destiny/profile-stats/:membershipType/:membershipId', async (req, res) => {
  try {
    const { membershipType, membershipId } = req.params;
    const components = '100,200,205,900,1000';
    const data = await fetchWithCache(
      `/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`,
      60000
    );
    const profile = data.Response?.profile?.data || {};
    const characters = data.Response?.characters?.data || {};
    const characterActivities = data.Response?.characterActivities?.data || {};
    const profileProgression = data.Response?.profileProgression?.data || {};
    const characterStats = data.Response?.characterStats?.data || {};

    const titles = (profileProgression?.seasonalArtifact?.titlesUnlocked || []);
    const triumphScore = profileProgression?.seasonalArtifact?.triumphScore || 0;

    const allCharStats = { kills: 0, deaths: 0, assists: 0, activitiesCleared: 0, timePlayed: '0s' };
    Object.values(characterStats).forEach(cs => {
      const allTime = cs?.allTime || {};
      allCharStats.kills += allTime.kills?.basic?.value || 0;
      allCharStats.deaths += allTime.deaths?.basic?.value || 0;
      allCharStats.assists += allTime.assists?.basic?.value || 0;
      allCharStats.activitiesCleared += allTime.activitiesCleared?.basic?.value || 0;
    });
    const kd = allCharStats.deaths > 0 ? (allCharStats.kills / allCharStats.deaths).toFixed(2) : 'N/A';

    const charSummaries = Object.entries(characters).map(([id, ch]) => ({
      id,
      classType: ch?.classType,
      light: ch?.light || 0,
      raceType: ch?.raceType,
      genderType: ch?.genderType,
      dateLastPlayed: ch?.dateLastPlayed
    }));

    res.json({
      displayName: profile?.userInfo?.displayName || 'Guardian',
      membershipType, membershipId,
      characterCount: Object.keys(characters).length,
      characters: charSummaries,
      stats: { kd, kills: Math.round(allCharStats.kills), deaths: Math.round(allCharStats.deaths), assists: Math.round(allCharStats.assists), activitiesCleared: Math.round(allCharStats.activitiesCleared) },
      triumphScore,
      titles: profileProgression?.checklists || [],
      dateLastPlayed: profile?.dateLastPlayed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/destiny/profile-loadout/:membershipType/:membershipId/:characterId', async (req, res) => {
  try {
    const { membershipType, membershipId, characterId } = req.params;
    const components = '200,201,205,300';
    const data = await fetchWithCache(
      `/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`,
      60000
    );

    const charData = data.Response?.characters?.data?.[characterId];
    const equipment = data.Response?.characterEquipment?.data?.[characterId]?.items || [];
    const activities = data.Response?.characterActivities?.data?.[characterId] || {};

    const buckets = {
      helmet: null, gauntlets: null, chest: null, legs: null, classItem: null,
      kinetic: null, energy: null, power: null, ghost: null
    };

    const bucketTypeMap = {
      3448274439: 'helmet', 3551919338: 'gauntlets', 14239492: 'chest',
      20886954: 'legs', 1585787867: 'classItem',
      1498876634: 'kinetic', 2465295065: 'energy', 953998645: 'power',
      4023194814: 'ghost'
    };

    equipment.forEach(item => {
      const bucket = bucketTypeMap[item.bucketHash];
      if (bucket) buckets[bucket] = item;
    });

    const classNames = { 0: 'Titan', 1: 'Hunter', 2: 'Warlock' };

    res.json({
      character: charData ? {
        classType: classNames[charData.classType] || 'Unknown',
        light: charData.light || 0,
        raceType: ['Human', 'Awoken', 'Exo'][charData.raceType] || 'Unknown',
        emblemPath: charData.emblemPath
      } : null,
      equipment: buckets,
      activities: activities.currentActivityHash || null,
      availableActivities: (activities.availableActivities || []).slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/twitch/streams', async (req, res) => {
  try {
    const games = ['Destiny%202', 'Marathon'];
    const allStreams = [];

    for (const game of games) {
      try {
        const r = await axios.get(
          `https://www.twitch.tv/directory/game/${game}`,
          { timeout: 10000, headers: { 'Accept': 'text/html', 'User-Agent': 'Mozilla/5.0' } }
        );
      } catch {}
    }

    res.json({
      streams: [],
      note: 'Twitch API key needed for live stream data'
    });
  } catch (err) {
    res.json({ streams: [], note: 'Twitch API key needed' });
  }
});

app.get('/api/twitch/top-streamers', (req, res) => {
  res.json({
    streamers: TOP_D2_STREAMERS,
    total: TOP_D2_STREAMERS.length,
    embedUrl: 'https://player.twitch.tv/?channel=CHANNEL&parent=localhost&parent=destiny-marathon-counter.onrender.com'
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    bungieApiConfigured: !!BUNGIE_API_KEY,
    playerCountsActive: collectionActive,
    historyPoints: playerHistory.length,
    currentData: currentPlayers
  });
});

app.get(['/trends', '/trends.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'trends.html'));
});

app.get(['/analytics', '/analytics.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'analytics.html'));
});

app.get(['/legacy', '/legacy.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'legacy.html'));
});

app.get(['/streamers', '/streamers.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'streamers.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Bungie API: ${BUNGIE_API_KEY ? 'configured' : 'NOT configured - set BUNGIE_API_KEY in .env'}`);
});

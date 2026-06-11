const express = require('express');
const path = require('path');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;

let cachedPlayers = null;
let cacheTime = 0;
const CACHE_TTL = 10000;

app.use(express.static(path.join(__dirname, 'public')));

async function getPlayers() {
  const now = Date.now();
  if (cachedPlayers && (now - cacheTime) < CACHE_TTL) return cachedPlayers;

  const [d2Res, maraRes] = await Promise.all([
    fetch('https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=1085660'),
    fetch('https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=3065800')
  ]);

  const [d2, mara] = await Promise.all([d2Res.json(), maraRes.json()]);

  cachedPlayers = {
    destiny2: d2.response.player_count,
    marathon: mara.response.player_count,
    timestamp: now
  };
  cacheTime = now;
  return cachedPlayers;
}

app.get('/api/players', async (req, res) => {
  try {
    const data = await getPlayers();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/og', async (req, res) => {
  try {
    const { destiny2, marathon } = await getPlayers();
    const total = destiny2 + marathon;
    const d2Pct = total > 0 ? (destiny2 / total) : 0.5;
    const d2Str = destiny2.toLocaleString();
    const maraStr = marathon.toLocaleString();

    const W = 1200;
    const H = 630;
    const marginX = 80;
    const centerX = W / 2;

    const font = 'Inter, system-ui, sans-serif';

    const svg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0d0d15"/>
          <stop offset="100%" stop-color="#0a0a0f"/>
        </linearGradient>
        <linearGradient id="d2-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="rgba(0,153,255,0.08)"/>
          <stop offset="100%" stop-color="rgba(0,153,255,0)"/>
        </linearGradient>
        <linearGradient id="mara-glow" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(255,107,0,0.08)"/>
          <stop offset="100%" stop-color="rgba(255,107,0,0)"/>
        </linearGradient>
        <linearGradient id="bar-d2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#0099ff"/>
          <stop offset="100%" stop-color="#00ccff"/>
        </linearGradient>
        <linearGradient id="bar-mara" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ff6b00"/>
          <stop offset="100%" stop-color="#ff3300"/>
        </linearGradient>
      </defs>

      <rect width="${W}" height="${H}" fill="url(#bg)"/>

      <!-- glows -->
      <ellipse cx="300" cy="${H/2}" rx="400" ry="${H}" fill="url(#d2-glow)"/>
      <ellipse cx="900" cy="${H/2}" rx="400" ry="${H}" fill="url(#mara-glow)"/>

      <!-- top label -->
      <text x="${centerX}" y="60" text-anchor="middle" fill="rgba(255,255,255,0.25)" font-family="${font}" font-size="13" font-weight="600" letter-spacing="6">LIVE PLAYER COUNT</text>
      <text x="${centerX}" y="82" text-anchor="middle" fill="rgba(255,255,255,0.12)" font-family="${font}" font-size="11" letter-spacing="3">STEAM CONCURRENT PLAYERS</text>

      <!-- Center bar -->
      <rect x="${marginX}" y="98" width="${W - 2*marginX}" height="1" fill="rgba(255,255,255,0.04)"/>

      <!-- Destiny 2 -->
      <text x="${marginX}" y="155" fill="rgba(255,255,255,0.2)" font-family="${font}" font-size="12" font-weight="600" letter-spacing="3">BUNGIE</text>
      <text x="${marginX}" y="195" fill="#0099ff" font-family="${font}" font-size="32" font-weight="800">Destiny 2</text>
      <text x="${marginX}" y="290" fill="#ffffff" font-family="${font}" font-size="80" font-weight="900" letter-spacing="-2">${d2Str}</text>
      <text x="${marginX}" y="320" fill="rgba(255,255,255,0.2)" font-family="${font}" font-size="12" font-weight="500" letter-spacing="2">CURRENT PLAYERS</text>

      <!-- VS -->
      <circle cx="${centerX}" cy="230" r="28" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <text x="${centerX}" y="237" text-anchor="middle" fill="rgba(255,255,255,0.25)" font-family="${font}" font-size="14" font-weight="800" letter-spacing="1">VS</text>

      <!-- Marathon -->
      <text x="${W - marginX}" y="155" text-anchor="end" fill="rgba(255,255,255,0.2)" font-family="${font}" font-size="12" font-weight="600" letter-spacing="3">BUNGIE</text>
      <text x="${W - marginX}" y="195" text-anchor="end" fill="#ff6b00" font-family="${font}" font-size="32" font-weight="800">Marathon</text>
      <text x="${W - marginX}" y="290" text-anchor="end" fill="#ffffff" font-family="${font}" font-size="80" font-weight="900" letter-spacing="-2">${maraStr}</text>
      <text x="${W - marginX}" y="320" text-anchor="end" fill="rgba(255,255,255,0.2)" font-family="${font}" font-size="12" font-weight="500" letter-spacing="2">CURRENT PLAYERS</text>

      <!-- Bottom bar -->
      <rect x="${marginX}" y="380" width="${W - 2*marginX}" height="40" rx="20" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      <rect x="${marginX + 4}" y="384" width="${(W - 2*marginX - 8) * d2Pct}" height="32" rx="16" fill="url(#bar-d2)"/>
      <rect x="${marginX + 4 + (W - 2*marginX - 8) * d2Pct}" y="384" width="${(W - 2*marginX - 8) * (1 - d2Pct)}" height="32" rx="16" fill="url(#bar-mara)"/>

      <!-- bar labels -->
      <text x="${marginX + 20}" y="405" fill="rgba(255,255,255,0.7)" font-family="${font}" font-size="13" font-weight="700">Destiny 2</text>
      <text x="${W - marginX - 20}" y="405" text-anchor="end" fill="rgba(255,255,255,0.7)" font-family="${font}" font-size="13" font-weight="700">Marathon</text>

      <!-- footer -->
      <text x="${centerX}" y="480" text-anchor="middle" fill="rgba(255,255,255,0.10)" font-family="${font}" font-size="11" letter-spacing="2">Data from Steam API \u2022 Updates every 15 seconds</text>
    </svg>`;

    const png = await sharp(Buffer.from(svg)).resize(W, H).png().toBuffer();

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.send(png);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Live counter running at http://localhost:${PORT}`);
});

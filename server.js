import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
let cache = {};
const CACHE_TIME = 60 * 1000;

app.get("/price", async (req, res) => {
  const item = req.query.name;
  if (!item) return res.status(400).json({ error: "Missing name" });

  const now = Date.now();
  if (cache[item] && now - cache[item].time < CACHE_TIME) {
    return res.json(cache[item].data);
  }

  try {
    // 🔹 STEAM
    const steamUrl = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=7&market_hash_name=${encodeURIComponent(item)}`;
    const steamRes = await fetch(steamUrl);
    const steamData = await steamRes.json();

    const steamPrice = steamData.lowest_price || steamData.median_price || null;

    // 🔹 CSFLOAT (preço médio)
    const csfloatUrl = `https://csfloat.com/api/v1/listings?market_hash_name=${encodeURIComponent(item)}`;
    const csfloatRes = await fetch(csfloatUrl);
    const csfloatData = await csfloatRes.json();

    let csfloatPrice = null;
    if (csfloatData && csfloatData.data && csfloatData.data.length > 0) {
      csfloatPrice = "R$ " + (csfloatData.data[0].price / 100).toFixed(2);
    }

    const markets = [];
    if (steamPrice) markets.push({ market: "Steam", price: steamPrice });
    if (csfloatPrice) markets.p

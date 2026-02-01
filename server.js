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
    const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=7&market_hash_name=${encodeURIComponent(item)}`;
    const response = await fetch(url);
    const data = await response.json();

    const result = {
      updated: new Date().toISOString(),
      markets: [
        {
          market: "Steam",
          price: data.lowest_price || data.median_price || "N/A"
        }
      ]
    };

    cache[item] = { time: now, data: result };
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: "Steam fetch failed" });
  }
});

app.listen(PORT, () => console.log("Server running on port", PORT));

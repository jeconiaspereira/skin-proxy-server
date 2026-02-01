import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// CACHE SIMPLES
let cache = {};
const CACHE_TIME = 60 * 1000; // 1 min

app.get("/price", async (req, res) => {
  const item = req.query.name;
  if (!item) return res.status(400).json({ error: "Missing name" });

  const now = Date.now();

  if (cache[item] && now - cache[item].time < CACHE_TIME) {
    return res.json(cache[item].data);
  }

  try {
    // EXEMPLO usando API pública (trocaremos depois)
    const response = await fetch(
      `https://api.csgoskins.gg/item/price?name=${encodeURIComponent(item)}`
    );
    const data = await response.json();

    const result = {
      updated: new Date().toISOString(),
      markets: data.markets || []
    };

    cache[item] = { time: now, data: result };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch price" });
  }
});

app.listen(PORT, () => console.log("Server running on port", PORT));

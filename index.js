const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

app.get("/reddit", async (req, res) => {
    const url = req.query.url;
    if (!url || !url.startsWith("https://")) {
        return res.status(400).json({ error: "Invalid URL" });
    }

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: `Reddit returned ${response.status}` });
        }

        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Proxy fetch failed", details: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});

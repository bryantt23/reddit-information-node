const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/reddit", async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl || !targetUrl.startsWith("http")) {
        return res.status(400).json({ error: "Missing or invalid URL" });
    }

    try {
        const redditRes = await fetch(targetUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (proxy server)" }
        });

        if (!redditRes.ok) {
            return res.status(redditRes.status).json({ error: "Upstream error" });
        }

        const data = await redditRes.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Proxy error: " + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});

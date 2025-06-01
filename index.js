const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();
require("dotenv").config();

app.use(cors());

// Get Reddit OAuth Token
async function getAccessToken() {
    const creds = Buffer.from(
        `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${creds}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "password",
            username: process.env.REDDIT_USERNAME,
            password: process.env.REDDIT_PASSWORD,
        }),
    });

    if (!response.ok) {
        throw new Error("Failed to get Reddit token: " + (await response.text()));
    }

    const data = await response.json();
    return data.access_token;
}

// Proxy endpoint
app.get("/reddit", async (req, res) => {
    const url = req.query.url;
    if (!url || !url.startsWith("https://")) {
        return res.status(400).json({ error: "Invalid URL" });
    }

    try {
        const token = await getAccessToken();
        const apiUrl = url.endsWith(".json") ? url : url.replace(/\/$/, "") + ".json";

        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                "User-Agent": "RedditScraper/0.1 by bryantt23",
            },
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
    console.log(`✅ Reddit proxy server running on port ${PORT}`);
});

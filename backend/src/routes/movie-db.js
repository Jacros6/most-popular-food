const express = require("express");
const router = express.Router();
const { MovieDb } = require("moviedb-promise");
const moviedb = new MovieDb(process.env.TMDB_API_KEY);
const keywords = require("../filters/stateKeywords.json");

router.get("/get-media", async (req, res) => {
  try {
    const id = req.query.id;
    const isTv = req.query.isTv === "true";
    if (!id) {
      return res.status(400).json({ error: "Media ID is required" });
    }
    if (typeof isTv !== "boolean") {
      return res.status(400).json({ error: "isTV must be a boolean" });
    }

    let data;
    console.log(id, isTv);

    if (isTv) {
      data = await moviedb.tvInfo({ id });
    } else {
      data = await moviedb.movieInfo({ id });
    }

    data.overview = sanitize(data.overview);

    const filtered_data = {
      overview: data.overview,
      title: data.title,
      poster_path: data.poster_path,
    };

    return res.json(filtered_data);
  } catch (error) {
    console.error("Error fetching movie:", error);
    res.status(500).json({ error: "Failed to fetch movie" });
  }
});

function sanitize(text) {
  for (const word of keywords) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    text = text.replace(regex, "_____");
  }
  return text;
}

module.exports = router;

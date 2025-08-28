const express = require("express");
const router = express.Router();
const { MovieDb } = require("moviedb-promise");
const moviedb = new MovieDb(process.env.TMDB_API_KEY);

router.get("/get-media", async (req, res) => {
  try {
    const { id, isTv } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Media ID is required" });
    }
    if (typeof isTv !== "boolean") {
      return res.status(400).json({ error: "isTV must be a boolean" });
    }

    let data;

    if (isTv) {
      data = await moviedb.tvInfo({ id });
    } else {
      data = await moviedb.movieInfo({ id });
    }

    return res.json(data);
  } catch (error) {
    console.error("Error fetching movie:", error);
    res.status(500).json({ error: "Failed to fetch movie" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { MovieDb } = require("moviedb-promise");
const moviedb = new MovieDb(process.env.TMDB_API_KEY);

router.get("/get-movie", async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Movie ID is required" });
    }

    const movie = await moviedb.movieInfo({ id });

    return res.json(movie);
  } catch (error) {
    console.error("Error fetching movie:", error);
    res.status(500).json({ error: "Failed to fetch movie" });
  }
});

module.exports = router;

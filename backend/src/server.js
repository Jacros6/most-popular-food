require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const movieDbRoute = require("../src/routes/movie-db");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.use("/api", movieDbRoute);

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});

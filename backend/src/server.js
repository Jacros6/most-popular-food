require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const movieDbRoute = require("./routes/movie-db");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use("/api", movieDbRoute);

const angularDistPath = path.join(
  __dirname,
  "../../dist/most-popular-food/browser"
);
app.use(express.static(angularDistPath));

app.get(/^\/(?!api).*$/, (req, res) => {
  res.sendFile(path.join(angularDistPath, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${port}`);
});

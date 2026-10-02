/* eslint-disable no-console */
const express = require("express");
const path = require("path");

const app = express();

const port = 8080;
const distPath = path.join(__dirname, "../out");

app.use(express.static(distPath));

app.get("/*", (req, res) => {
  res.sendFile("index.html", { root: distPath });
});

app.listen(port, () => {});

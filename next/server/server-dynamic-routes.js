/* eslint-disable no-console */

const express = require("express");
const next = require("next");
const compression = require("compression");
const helmet = require("helmet");
const cluster = require("cluster");
const os = require("os");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: path.join(__dirname, "..") });
const handle = app.getRequestHandler();

const numCPUs = os.cpus().length;

if (cluster.isMaster && !dev) {
  console.log(`Master process ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Starting a new worker...`);
    cluster.fork();
  });
} else {
  app.prepare().then(() => {
    const server = express();

    // Security headers with Helmet
    server.use(
      helmet({
        contentSecurityPolicy: false, // Disable CSP if it interferes with Next.js scripts, or configure properly
        crossOriginEmbedderPolicy: false,
      }),
    );

    // Compress all responses
    server.use(compression());

    // Serve static files with caching
    const distPath = path.join(__dirname, "../out");
    server.use(
      express.static(distPath, {
        maxAge: "1d",
        immutable: true,
      }),
    );

    // Catch-all handler to allow dynamic routes
    server.get("*", (req, res) => {
      return handle(req, res);
    });

    const port = process.env.PORT || 8080;
    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`Worker ${process.pid} started and listening on port ${port}`);
    });
  });
}

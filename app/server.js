import express from "express";
import ViteExpress from "vite-express";
import "dotenv/config";

import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "db",
  password: "sparkhacks",
});

const app = express();

app.use(express.static("public"));

app.get("/api/ping", async (req, res, next) => {
  try {
    await db.connect();
    await db.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY
    );`);
    res.send("PONG");
  } catch (err) {
    console.error(err);
  } finally {
    await db.end();
  }
});

ViteExpress.listen(
  app,
  8000,
  () => console.log("Server is listening... on port 8000"),
);

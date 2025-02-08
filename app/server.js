import express from "express";
import ViteExpress from "vite-express";
import "dotenv/config";
import { perform_action } from "./db.js";

const app = express();

app.use(express.static("public"));

async function init_db() {
  await perform_action(`
    CREATE TABLE IF NOT EXISTS Attachment (
      id SERIAL PRIMARY KEY,
      file_path TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `)

  await perform_action(`
    CREATE TABLE IF NOT EXISTS Account (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT valid_email CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
      CONSTRAINT username_min_length CHECK (LENGTH(username) >= 8),
      CONSTRAINT password_min_length CHECK (LENGTH(password) >= 8)
    );
  `);

  await perform_action(`
    CREATE TABLE IF NOT EXISTS Business (
      id SERIAL PRIMARY KEY,
      account_id INTEGER UNIQUE NOT NULL,
      location POINT,
      category TEXT NOT NULL,
      phone_number TEXT NOT NULL,
      description TEXT,
      collage_attachments INTEGER[],
      FOREIGN KEY (account_id) REFERENCES Account(id) ON DELETE CASCADE
    ) INHERITS (Account);

  `);

  await perform_action(`
    CREATE TABLE IF NOT EXISTS Support (
      id SERIAL PRIMARY KEY,
      account_id INTEGER REFERENCES Account(id) NOT NULL,
      business_id INTEGER REFERENCES Business(id) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await perform_action(`
    CREATE TABLE IF NOT EXISTS Post (
      id SERIAL PRIMARY KEY,
      contents TEXT NOT NULL,
      attachments INTEGER[],
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

await init_db();

ViteExpress.listen(
  app,
  8000,
  () => console.log("Server is listening... on port 8000"),
);

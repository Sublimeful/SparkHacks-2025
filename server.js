import express from "express";
import ViteExpress from "vite-express";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));

ViteExpress.listen(app, port, () => console.log("Server is listening..."));

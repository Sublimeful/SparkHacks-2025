import express from "express";
import ViteExpress from "vite-express";
import "dotenv/config";

const app = express();

app.use(express.static("public"));

ViteExpress.listen(app, 8000, () => console.log("Server is listening... on port 8000"));

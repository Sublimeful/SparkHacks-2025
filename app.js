import express from "express";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

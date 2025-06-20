import express from "express";
import chalk from "chalk";

import tradeHandler from "./trade/index.js";

const app = express();

(async () => {
  await tradeHandler();
})();

const PORT = 5000;

app.listen(PORT);

// chalk.green.inverse(`\n\nProcessing Liquidity check.....`)

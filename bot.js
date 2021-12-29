import express from "express";
import chalk from "chalk";

import tradeHandler from "./trade/index.js";

const app = express();

(async () => {
  await tradeHandler();
})();

const PORT = 5000;

app.listen(
  PORT,
  console.log(
    chalk.yellowBright(
      `Pancake-bot-v1 Running...`,
      chalk.green.inverse(`\n\nProcessing Liquidity check.....`)
    )
  )
);

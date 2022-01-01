import chalk from "chalk";

import initializeExchange from "../exchanges/index.js";
import checkLiqAdd from "../events/liqAdd.js";
import honeyPotCheck from "../protection/honeypotCheck.js";
import buyEnabledCheck from "../protection/buyEnabledCheck.js";
import buy from "./buy.js";
import approve from "./approve.js";
import bookProfit from "./bookProfit.js";
import sell from "./sell.js";
import {
  connectToChain,
  getEnv,
  sleep,
  inquirerPrompt,
  getLocalTimeStamp,
} from "../utils/index.js";
import { config } from "dotenv";

const envs = getEnv();
const { checkHoneyPot, exitIfError, checkIfBuyEnabled } = envs;

const { web3, account } = connectToChain();

const exchanges = initializeExchange({
  account,
  envs,
  web3,
});

const globalObj = {
  isLiqAdded: false,
  isLiqGteMinExpectedLiq: false,
  isTokenHoneyPot: false,
  isTokenBought: false,
  isTokenApproved: false,
  isProfitBooked: false,
  isTokenSold: false,
};

const handleLiqEvent = async () => {
  //Listening for liquidity addition
  if (!globalObj.isLiqAdded) {
    const { isLiqAdded, isLiqGteMinExpectedLiq, totalLiq } = await checkLiqAdd({
      envs,
      exchanges,
    });
    globalObj.isLiqAdded = isLiqAdded;
    globalObj.isLiqGteMinExpectedLiq = isLiqGteMinExpectedLiq;
    globalObj.totalLiq = totalLiq;
  }
};

const handleHoneyPotCheck = async () => {
  //Buy once liq is added
  if (globalObj.isLiqAdded && !globalObj.isTokenBought) {
    //Ready to buy the token
    const { isTokenHoneyPot, error } = await honeyPotCheck({
      envs,
      exchanges,
    });
    if (error && exitIfError === "true") {
      process.exit();
    }
    globalObj.honeyPotCheck = isTokenHoneyPot;
  }
};

const handleBuyEnabledCheck = async () => {
  //Buy once liq is added
  if (globalObj.isLiqAdded && !globalObj.isTokenBought) {
    //Ready to buy the token
    const { isBuyEnabled, error } = await buyEnabledCheck({
      envs,
      exchanges,
    });
    if (error && exitIfError === "true") {
      process.exit();
    }
    globalObj.isBuyEnabled = isBuyEnabled;
  }
};

const handleBuy = async () => {
  //Buy once liq is added
  if (globalObj.isLiqAdded && !globalObj.isTokenBought) {
    //Ready to buy the token
    const { isTokenBought } = await buy({ envs, exchanges });
    globalObj.isTokenBought = isTokenBought;
  }
};

const handleApprove = async () => {
  //Approve after buy
  if (
    globalObj.isLiqAdded &&
    globalObj.isTokenBought &&
    !globalObj.isTokenApproved
  ) {
    const { isTokenApproved } = await approve({ envs, exchanges });
    globalObj.isTokenApproved = isTokenApproved;
  }
};

const handleProfitBooking = async () => {
  //Approve after buy
  if (
    globalObj.isLiqAdded &&
    globalObj.isTokenBought &&
    globalObj.isTokenApproved &&
    !globalObj.isProfitBooked
  ) {
    const { isProfitBooked } = await bookProfit({ envs, exchanges });
    globalObj.isProfitBooked = isProfitBooked;
  }
};

const handleSell = async () => {
  //Sell after approving
  if (
    globalObj.isLiqAdded &&
    globalObj.isTokenBought &&
    globalObj.isTokenApproved &&
    globalObj.isProfitBooked &&
    !globalObj.isTokenSold
  ) {
    const { isTokenSold } = await sell({ envs, exchanges });
    globalObj.isTokenSold = isTokenSold;
  }
};

const tradeHandler = async () => {
  try {
    console.log(
      chalk.yellow(
        `============ NICK BOT VERSION BETA v1.0.0.1000 ============`
      )
    );

    await sleep(3000);

    console.log(chalk.whiteBright("\nBot connected to Pancakeswap - BSC"));
    console.log(chalk.whiteBright(`Wallet - ${account.address}`));

    console.log(chalk.whiteBright(`\nBot config for current snipe : `));
    console.log(chalk.whiteBright(`\--------------------------------`));
    console.log(chalk.whiteBright(`\nChain - ${`BSC-Pancakeswap`}`));
    console.log(chalk.whiteBright(`Address - ${account.address}`));
    console.log(
      chalk.whiteBright(`Token to snipe - ${envs.purchaseTokenAddress}`)
    );
    console.log(
      chalk.whiteBright(`Amount for purchase - ${envs.AMOUNT_OF_BNB}`)
    );
    console.log(chalk.whiteBright(`Slippage - ${envs.Slippage}`));
    console.log(chalk.whiteBright(`Min Liq - ${envs.minBnb}`));
    console.log(chalk.whiteBright(`Buy | Sell GWEI - ${envs.gasPrice}`));
    console.log(chalk.whiteBright(`Buy | Sell GASLIMIT - ${envs.gasLimit}`));
    console.log(
      chalk.whiteBright(`Buy check enabled - ${envs.checkIfBuyEnabled}`)
    );
    console.log(chalk.whiteBright(`Max Buy Tax - ${envs.maxSellTax}`));
    console.log(chalk.whiteBright(`Max Sell Tax - ${envs.maxSellTax}`));
    console.log(
      chalk.whiteBright(
        `HoneyPot checker address - ${envs.honeyPotCheckerAddress}`
      )
    );
    console.log(chalk.whiteBright(`Check HoneyPot - ${envs.checkHoneyPot}`));
    console.log(chalk.whiteBright(`Exit If Error - ${envs.exitIfError}\n`));

    const { startSnipe } = await inquirerPrompt();

    if (!startSnipe) {
      console.log(chalk.red(`\nUpdate bot config & Restart the bot again...`));
      process.exit();
    }

    console.log(chalk.whiteBright("\nStarting..."));
    console.log(chalk.whiteBright(`---------------`));

    console.log(
      chalk.whiteBright(`\n${getLocalTimeStamp()} | Scanning new block`)
    );

    do {
      await handleLiqEvent();
    } while (!globalObj.isLiqAdded || !globalObj.isLiqGteMinExpectedLiq);
    // console.log("🚀 ~ file: bot.js ~ line 52 ~ globalObj", globalObj);

    console.log(
      chalk.green(
        `\n${getLocalTimeStamp()} | Liquidity found!! -- ${globalObj.totalLiq}`
      )
    );

    if (checkHoneyPot === "true") {
      await handleHoneyPotCheck();
      if (globalObj.isTokenHoneyPot) {
        process.exit();
      }
    }

    if (checkIfBuyEnabled === "true") {
      console.log(chalk.green(`\nProcessing buy enabled check.....`));
      do {
        await handleBuyEnabledCheck();
      } while (!globalObj.isBuyEnabled && globalObj.exitIfError === "false");
      globalObj.isBuyEnabled && console.log(chalk.green(`\nBuy Enabled.....`));
    }

    await handleBuy();
    // console.log("🚀 ~ file: bot.js ~ line 52 ~ globalObj", globalObj);

    await handleApprove();
    // console.log("🚀 ~ file: bot.js ~ line 52 ~ globalObj", globalObj);

    //Listening for token price changes to book profit
    console.log(chalk.green.inverse(`\nProcessing profit booking.....`));
    do {
      await handleProfitBooking();
    } while (!globalObj.isProfitBooked);
    // console.log("🚀 ~ file: bot.js ~ line 52 ~ globalObj", globalObj);

    await handleSell();
    // console.log("🚀 ~ file: bot.js ~ line 52 ~ globalObj", globalObj);

    return;
  } catch (err) {
    const error = JSON.parse(JSON.stringify(err));
    console.log(error);
  }
};

export default tradeHandler;

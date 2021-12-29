import ethers from "ethers";
import Web3 from "web3";
import chalk from "chalk";

import transformEnv from "../transformEnv.js";
import initializeExchange from "../exchanges/index.js";
import checkLiqAdd from "../events/liqAdd.js";
import honeyPotCheck from "../protection/honeypotCheck.js";
import buyEnabledCheck from "../protection/buyEnabledCheck.js";
import buy from "./buy.js";
import approve from "./approve.js";
import bookProfit from "./bookProfit.js";
import sell from "./sell.js";

const envs = transformEnv();
const { mnemonic, wss, checkHoneyPot, exitIfError, checkIfBuyEnabled } = envs;

const provider = new ethers.providers.WebSocketProvider(wss);
const wallet = new ethers.Wallet(mnemonic);
const account = wallet.connect(provider);

//W3 Provider
const w3Provider = new Web3(new Web3.providers.WebsocketProvider(wss)); // WSS
const web3 = new Web3(w3Provider);

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
    const { isLiqAdded, isLiqGteMinExpectedLiq } = await checkLiqAdd({
      envs,
      exchanges,
    });
    globalObj.isLiqAdded = isLiqAdded;
    globalObj.isLiqGteMinExpectedLiq = isLiqGteMinExpectedLiq;
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
    do {
      await handleLiqEvent();
    } while (!globalObj.isLiqAdded || !globalObj.isLiqGteMinExpectedLiq);
    // console.log("🚀 ~ file: bot.js ~ line 52 ~ globalObj", globalObj);

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
      } while (!globalObj.isBuyEnabled);
      console.log(chalk.green(`\nBuy Enabled.....`));
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
    console.log(`Error caused by : 
          {
          reason : ${error.reason},
          transactionHash : ${error.transactionHash}
          message : ${error}
          }`);
    console.log(error);
  }
};

export default tradeHandler;

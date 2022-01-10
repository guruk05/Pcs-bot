import chalk from "chalk";
import ethers from "ethers";
import { Spinner } from "cli-spinner";

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
  getLatestBlock,
} from "../utils/index.js";

const envs = getEnv();
const {
  chain,
  network,
  exchange,
  checkHoneyPot,
  exitIfError,
  checkIfBuyEnabled,
  isTokenApproved,
} = envs;

const { web3, provider, account } = connectToChain();

const exchanges = initializeExchange({
  account,
  envs,
  web3,
});

const globalObj = {
  isLiqAdded: false,
  addLiqTransBlockNo: "",
  isLiqGteMinExpectedLiq: false,
  isTokenHoneyPot: false,
  isTokenBought: false,
  isTokenApproved: isTokenApproved === "true" ? true : false,
  isProfitBooked: false,
  isTokenSold: false,
  latestBlockNumber: "",
};

const spinner = new Spinner(
  chalk.whiteBright(`Listening Mempool for liquidity addition %s`)
);
spinner.setSpinnerString("|/-\\");

const getTradeFuncArgs = () => {
  return {
    envs,
    exchanges,
    latestBlockNumber: globalObj.latestBlockNumber,
  };
};

const handleLiqEvent = async () => {
  try {
    //Listening for liquidity addition
    if (!globalObj.isLiqAdded) {
      const { isLiqAdded, isLiqGteMinExpectedLiq, totalLiq, spinner } =
        await checkLiqAdd(getTradeFuncArgs());
      globalObj.isLiqAdded = isLiqAdded;
      globalObj.isLiqGteMinExpectedLiq = isLiqGteMinExpectedLiq;
      globalObj.totalLiq = totalLiq;
      globalObj.spinner = spinner;
    }
  } catch (err) {
    console.log("🚀 ~ file: index.js ~ line 207 ~ handleSell ~ err", err);
    throw err;
  }
};

const handleHoneyPotCheck = async () => {
  try {
    //Buy once liq is added
    if (globalObj.isLiqAdded && !globalObj.isTokenBought) {
      //Ready to buy the token
      const { isTokenHoneyPot, error } = await honeyPotCheck(
        getTradeFuncArgs()
      );
      if (error && exitIfError === "true") {
        process.exit();
      }
      globalObj.honeyPotCheck = isTokenHoneyPot;
    }
  } catch (err) {
    console.log("🚀 ~ file: index.js ~ line 207 ~ handleSell ~ err", err);
    throw err;
  }
};

const handleBuyEnabledCheck = async () => {
  try {
    //Buy once liq is added
    if (globalObj.isLiqAdded && !globalObj.isTokenBought) {
      //Ready to buy the token
      const { isBuyEnabled, error } = await buyEnabledCheck(getTradeFuncArgs());
      if (error && exitIfError === "true") {
        process.exit();
      }
      globalObj.isBuyEnabled = isBuyEnabled;
    }
  } catch (err) {
    console.log("🚀 ~ file: index.js ~ line 207 ~ handleSell ~ err", err);
    throw err;
  }
};

const handleBuy = async () => {
  try {
    //Buy once liq is added
    if (globalObj.isLiqAdded && !globalObj.isTokenBought) {
      console.log(chalk.yellow(`--------------------------------------------`));
      //Ready to buy the token
      const { isTokenBought, latestBlockNumber } = await buy(
        getTradeFuncArgs()
      );
      globalObj.isTokenBought = isTokenBought;
      globalObj.latestBlockNumber = latestBlockNumber;
    }
  } catch (err) {
    console.log("🚀 ~ file: index.js ~ line 207 ~ handleSell ~ err", err);
    throw err;
  }
};

const handleApprove = async () => {
  try {
    //Approve after buy
    if (
      globalObj.isLiqAdded &&
      globalObj.isTokenBought &&
      !globalObj.isTokenApproved
    ) {
      console.log(chalk.yellow(`--------------------------------------------`));
      const { isTokenApproved, latestBlockNumber } = await approve(
        getTradeFuncArgs()
      );
      globalObj.isTokenApproved = isTokenApproved;
      globalObj.latestBlockNumber = latestBlockNumber;
    }
  } catch (err) {
    console.log("🚀 ~ file: index.js ~ line 207 ~ handleSell ~ err", err);
    throw err;
  }
};

const handleProfitBooking = async () => {
  try {
    //Approve after buy
    if (
      globalObj.isLiqAdded &&
      globalObj.isTokenBought &&
      globalObj.isTokenApproved &&
      !globalObj.isProfitBooked
    ) {
      console.log(chalk.yellow(`--------------------------------------------`));
      const { isProfitBooked } = await bookProfit(getTradeFuncArgs());
      globalObj.isProfitBooked = isProfitBooked;
    }
  } catch (err) {
    console.log("🚀 ~ file: index.js ~ line 207 ~ handleSell ~ err", err);
    throw err;
  }
};

const handleSell = async () => {
  try {
    //Sell after approving
    if (
      globalObj.isLiqAdded &&
      globalObj.isTokenBought &&
      globalObj.isTokenApproved &&
      globalObj.isProfitBooked &&
      !globalObj.isTokenSold
    ) {
      console.log(chalk.yellow(`--------------------------------------------`));
      const { isTokenSold, latestBlockNumber } = await sell(getTradeFuncArgs());
      globalObj.isTokenSold = isTokenSold;
      globalObj.latestBlockNumber = latestBlockNumber;
    }
  } catch (err) {
    console.log("🚀 ~ file: index.js ~ line 207 ~ handleSell ~ err", err);
    throw err;
  }
};

const scanMemPool = async () => {
  const addLiqMethodIds = {
    addLiquidityETH: "0xf305d719",
    addLiquidity: "0xe8e33700",
  };

  const toLowerCase = (address) => address.toLowerCase();

  const subString = (address) => toLowerCase(address).substring(2);

  return new Promise(function (resolve, reject) {
    spinner.start();

    provider.on("Pending", (tx) => {
      provider
        .getTransaction(tx)
        .then(async (transaction) => {
          if (
            transaction &&
            transaction.to &&
            toLowerCase(transaction.to) === toLowerCase(envs.routerAddress) &&
            transaction["data"].includes(addLiqMethodIds.addLiquidityETH) &&
            transaction["data"].includes(subString(envs.purchaseTokenAddress))
          ) {
            spinner.stop();
            console.log(
              chalk.yellow(`--------------------------------------------`)
            );
            console.log(
              chalk.whiteBright(
                `\n${getLocalTimeStamp()} | Block : ${
                  transaction.blockNumber ? transaction.blockNumber : "Pending"
                } | Liquidity transaction found!! --> Pending | Hash : ${
                  transaction.hash
                }`
              )
            );

            const receipt = await provider.waitForTransaction(transaction.hash);

            if (receipt) {
              const receiptJson = JSON.parse(JSON.stringify(receipt));
              globalObj.addLiqTransBlockNo = receiptJson.blockNumber;
              resolve();
            }
          }
        })
        .catch((err) => {
          console.log(
            "🚀 ~ file: index.js ~ line 259 ~ provider.on ~ err",
            err
          );
          reject(err);
        });
    });
  });
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
    console.log(chalk.whiteBright(`\nChain - ${chain}`));
    console.log(chalk.whiteBright(`Network - ${network}`));
    console.log(chalk.whiteBright(`Exchange - ${exchange}`));
    console.log(chalk.whiteBright(`Your Wallet - ${account.address}`));
    console.log(
      chalk.whiteBright(`Token to snipe - ${envs.purchaseTokenAddress}`)
    );
    console.log(
      chalk.whiteBright(`Amount for purchase - ${envs.AMOUNT_OF_BNB}`)
    );
    console.log(chalk.whiteBright(`Slippage percent- ${envs.Slippage}`));
    console.log(chalk.whiteBright(`Liquidity minimum - ${envs.minBnb}`));
    console.log(chalk.whiteBright(`Buy | Sell GWEI - ${envs.gasPrice}`));
    console.log(chalk.whiteBright(`Buy | Sell GASLIMIT - ${envs.gasLimit}`));
    console.log(
      chalk.whiteBright(`Buy trade check - ${envs.checkIfBuyEnabled}`)
    );
    console.log(chalk.whiteBright(`Max Buy Tax - ${envs.maxSellTax}`));
    console.log(chalk.whiteBright(`Max Sell Tax - ${envs.maxSellTax}`));
    console.log(
      chalk.whiteBright(
        `HoneyPot checker address - ${envs.honeyPotCheckerAddress}`
      )
    );
    console.log(chalk.whiteBright(`Honeypot check - ${envs.checkHoneyPot}`));
    console.log(chalk.whiteBright(`Exit If Error - ${envs.exitIfError}\n`));

    const { startSnipe } = await inquirerPrompt();

    if (!startSnipe) {
      console.log(chalk.red(`\nUpdate bot config & Restart the bot again...`));
      process.exit();
    }

    console.log(chalk.whiteBright("\nStarting..."));
    console.log(chalk.whiteBright(`---------------`));

    console.log(
      chalk.whiteBright(
        `\n${getLocalTimeStamp()} | Block : ${await getLatestBlock(
          provider
        )} | Scanning new block`
      )
    );

    // return;

    await handleLiqEvent();

    // console.log(
    //   "🚀 ~ file: index.js ~ line 280 ~ tradeHandler ~ globalObj.isLiqAdded",
    //   globalObj.isLiqAdded
    // );
    if (!globalObj.isLiqAdded) {
      globalObj.spinner.stop();
      await scanMemPool();
    }

    while (!globalObj.isLiqAdded || !globalObj.isLiqGteMinExpectedLiq) {
      await handleLiqEvent();
      // code block to be executed
    }

    if (
      !globalObj.addLiqTransBlockNo ||
      globalObj.addLiqTransBlockNo.length === 0
    ) {
      globalObj.latestBlockNumber = await getLatestBlock(provider);
    } else {
      globalObj.latestBlockNumber = globalObj.addLiqTransBlockNo;
    }
    // do {
    //   await handleLiqEvent();
    // } while (!globalObj.isLiqAdded || !globalObj.isLiqGteMinExpectedLiq);
    // console.log("🚀 ~ file: bot.js ~ line 52 ~ globalObj", globalObj);
    console.log(
      chalk.green(
        `${getLocalTimeStamp()} | Block : ${
          globalObj.latestBlockNumber
        } | Liquidity found!! -- ${globalObj.totalLiq}`
      )
    );

    // return;
    // return;

    // if (checkHoneyPot === "true") {
    //   await handleHoneyPotCheck();
    //   if (globalObj.isTokenHoneyPot) {
    //     process.exit();
    //   }
    // }

    // if (checkIfBuyEnabled === "true") {
    //   console.log(chalk.green(`\nProcessing buy enabled check.....`));
    //   do {
    //     await handleBuyEnabledCheck();
    //   } while (!globalObj.isBuyEnabled && globalObj.exitIfError === "false");
    //   globalObj.isBuyEnabled && console.log(chalk.green(`\nBuy Enabled.....`));
    // }

    await handleBuy();
    // console.log("🚀 ~ file: bot.js ~ line 52 ~ globalObj", globalObj);

    await handleApprove();
    // console.log("🚀 ~ file: bot.js ~ line 52 ~ globalObj", globalObj);

    //Listening for token price changes to book profit
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

import chalk from "chalk";
import { Spinner } from "cli-spinner";

import { getLocalTimeStamp, logExitIfErrorCases } from "../../utils/index.js";

const globalObj = {
  isLiqGteMinLogPrinted: false,
  isPairNotCreatedLogPrinted: false,
  prevTotalLiq: 0,
  isBuyEnabledLogPrinted: false,
};

const liqAddResValidator = (params) => {
  const {
    isLiqAdded,
    isLiqGteMinExpectedLiq,
    pairAddress,
    totalLiq,
    minBnb,
    latestBlockNumber,
  } = params;

  const spinner = new Spinner(
    "Waiting for Liq/Liq Add to be > Min Liq threshold | Safe to Exit if required! -> ctrl+c %s"
  );

  if (totalLiq !== globalObj.prevTotalLiq) {
    // spinner.stop();
    globalObj.isLiqGteMinLogPrinted = false;
    globalObj.isPairNotCreatedLogPrinted = false;
  }

  globalObj.prevTotalLiq = totalLiq;

  if (!pairAddress && totalLiq <= 0 && !globalObj.isPairNotCreatedLogPrinted) {
    console.log(
      chalk.redBright(
        `${getLocalTimeStamp()} | Block : ${
          latestBlockNumber ? latestBlockNumber : "Pending"
        } | Pair not found | Waiting for Pair creation & liquidity add | Current Liq : ${chalk.white(
          totalLiq
        )} | Min Liq to snipe : ${chalk.white(minBnb)}`,
        chalk.whiteBright(
          "\nWaiting for Liq/Liq Add to be > Min Liq threshold | Safe to Exit if required! -> ctrl+c"
        )
      )
    );
    // spinner.start();
    globalObj.isPairNotCreatedLogPrinted = true;
  }

  if (
    !isLiqAdded &&
    !isLiqGteMinExpectedLiq &&
    parseFloat(totalLiq) > 0 &&
    !globalObj.isLiqGteMinLogPrinted
  ) {
    console.log(
      chalk.redBright(
        `${getLocalTimeStamp()} | Block : ${
          latestBlockNumber ? latestBlockNumber : "Pending"
        } | Pair Liquidity did not meet min threshold | Current Liq : ${chalk.white(
          totalLiq
        )} | Min Liq to snipe : ${chalk.white(minBnb)}`,
        chalk.whiteBright(
          "\nWaiting for Liq/Liq Add to be > Min Liq threshold | Safe to Exit if required! -> ctrl+c"
        )
      )
    );
    // spinner.start();
    globalObj.isLiqGteMinLogPrinted = true;
  }

  if (isLiqAdded && isLiqGteMinExpectedLiq && parseFloat(totalLiq) > 0) {
    console.log(
      chalk.green(
        `${getLocalTimeStamp()} | Block : ${
          latestBlockNumber ? latestBlockNumber : "Pending"
        } | Liquidity found!! -- ${totalLiq}`
      )
    );
  }
};

const honeyPotResValidator = (params) => {
  const {
    isTokenHoneyPot,
    error,
    errorMessage,
    envs,
    approve,
    sell,
    buyTax,
    sellTax,
    isBuyTaxGteMaxBuyTax,
    isSellTaxGteMaxSellTax,
    latestBlockNumber,
  } = params;
  const { exitIfError, maxBuyTax, maxSellTax } = envs;

  if (approve && sell) {
    console.log(
      chalk.green(
        `${getLocalTimeStamp()} | Block : ${
          latestBlockNumber ? latestBlockNumber : "Pending"
        } | Token is NOT a Honeypot!`
      )
    );
  } else if ((!approve || !sell) && !error) {
    console.log(
      chalk.red(
        `${getLocalTimeStamp()} | Block : ${
          latestBlockNumber ? latestBlockNumber : "Pending"
        } | Token is Honeypot, exiting!`
      )
    );
  }

  if (isBuyTaxGteMaxBuyTax) {
    console.log(
      chalk.red(
        `${getLocalTimeStamp()} | Block : ${
          latestBlockNumber ? latestBlockNumber : "Pending"
        } | Buy Tax : ${chalk.white(buyTax)} | MaxBuy Tax : ${chalk.white(
          maxBuyTax
        )} | Token BuyTax exceeds maxBuyTax, exiting!`
      )
    );
  }

  if (isSellTaxGteMaxSellTax) {
    console.log(
      chalk.red(
        `${getLocalTimeStamp()} | Block : ${
          latestBlockNumber ? latestBlockNumber : "Pending"
        } | Sell Tax : ${chalk.white(sellTax)} | MaxSell Tax : ${chalk.white(
          maxSellTax
        )} | Token SellTax exceeds MaxSellTax, exiting!`
      )
    );
  }

  if (error) {
    console.log(
      chalk.red(
        `${getLocalTimeStamp()} | Block : ${
          latestBlockNumber ? latestBlockNumber : "Pending"
        } | HoneyPot Check Failed`,
        `\nError Message : ${errorMessage}`
      )
    );
  }

  logExitIfErrorCases({ error, envs });

  if (isTokenHoneyPot) {
    process.exit();
  }
};

const buyEnabledCheckResValidator = (params) => {
  const { isBuyEnabled, error, errorMessage, envs, latestBlockNumber } = params;
  if (isBuyEnabled && !globalObj.isBuyEnabledLogPrinted && !error) {
    console.log(
      chalk.green(
        `${getLocalTimeStamp()} | Block : ${
          latestBlockNumber ? latestBlockNumber : "Pending"
        } | Buy Enabled!!`
      )
    );
    globalObj.isBuyEnabledLogPrinted = true;
  }

  if (error) {
    console.log(
      chalk.red(
        `${getLocalTimeStamp()} | Block : ${
          latestBlockNumber ? latestBlockNumber : "Pending"
        } | Buy Enabled Check Failed`,
        `\nError Message : ${errorMessage}`
      )
    );
  }

  logExitIfErrorCases({ error, envs });
};

const buyResValidator = (params) => {
  const { isTokenBought, buyTxBlockNo, transactionUrl } = params;

  if (isTokenBought) {
    console.log(
      chalk.green(
        `${getLocalTimeStamp()} | Block : ${buyTxBlockNo} | Buy successful!!`,
        chalk.white(`\nTransaction URL : ${transactionUrl}`)
      )
    );
  }
};

const approveResValidator = (params) => {
  const { isTokenApproved, approveTxBlockNo } = params;

  if (isTokenApproved) {
    console.log(
      chalk.green(
        `${getLocalTimeStamp()} | Block : ${
          approveTxBlockNo ? approveTxBlockNo : "Pending"
        } | Approve successful!!`
      )
    );
  }
};

const bookProfitResValidator = (params) => {
  const { isProfitBooked, currentValue, profitDesired, latestBlockNumber } =
    params;

  if (isProfitBooked) {
    console.log(
      chalk.green(
        `${getLocalTimeStamp()} | Block : ${
          latestBlockNumber ? latestBlockNumber : "Pending"
        } | Current price : ${chalk.white(currentValue)} | Profit Booked!!`
      )
    );
  } else if (!isProfitBooked) {
    console.log(
      chalk.whiteBright(
        `${getLocalTimeStamp()} | Block : ${
          latestBlockNumber ? latestBlockNumber : "Pending"
        } | Current price : ${currentValue} | Profit target : ${profitDesired}`
      )
    );
  }
};

const sellResValidator = (params) => {
  const { isTokenSold, sellTxBlockNo, transactionUrl } = params;

  if (isTokenSold) {
    console.log(
      chalk.green(
        `${getLocalTimeStamp()} | Block : ${
          sellTxBlockNo ? sellTxBlockNo : "Pending"
        } | Sell successful!!`,
        chalk.white(`\nTransaction URL : ${transactionUrl}`)
      )
    );
  }
};

export {
  liqAddResValidator,
  honeyPotResValidator,
  buyEnabledCheckResValidator,
  buyResValidator,
  approveResValidator,
  bookProfitResValidator,
  sellResValidator,
};

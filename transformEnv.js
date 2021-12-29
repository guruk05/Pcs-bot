import ethers from "ethers";
import chalk from "chalk";

import config from "./config.js";

const transformEnv = () => {
  const transformedEnvs = {
    bnbAddress: config.BNB_CONTRACT, //bnb

    purchaseTokenAddress: config.TO_PURCHASE, // token that you will purchase = BUSD for test '0xe9e7cea3dedca5984780bafc599bd69add087d56'

    AMOUNT_OF_BNB: config.AMOUNT_OF_BNB, // how much you want to buy in BNB

    factoryAddress: config.FACTORY, //PancakeSwap V2 factory

    routerAddress: config.ROUTER, //PancakeSwap V2 router

    recipient: config.YOUR_ADDRESS, //your wallet address,

    Slippage: config.SLIPPAGE, //in Percentage

    gasPrice: ethers.utils.parseUnits(`${config.GWEI}`, "gwei"), //in gwei

    gasLimit: config.GAS_LIMIT, //at least 21000

    minBnb: config.MIN_LIQUIDITY_ADDED, //min liquidity added

    explorerUrl: config.EXPLORER_URL,

    profitXamount: config.PROFIT_X_AMOUNT,

    checkIfBuyEnabled: config.BUY_ENABLE_CHECK,

    honeyPotCheckerAddress: config.HONEYPOT_CHECKER,
    exitIfError: config.EXIT_IF_ERROR,

    maxBuyTax: config.MAX_BUY_TAX,
    maxSellTax: config.MAX_SELL_TAX,
  };

  transformedEnvs.wss = config.WSS_NODE;
  transformedEnvs.checkHoneyPot = config.CHECK_HONEYPOT;
  transformedEnvs.mnemonic = config.YOUR_MNEMONIC; //your privateKey;
  transformedEnvs.tokenIn = transformedEnvs.bnbAddress;
  transformedEnvs.tokenOut = transformedEnvs.purchaseTokenAddress;
  //We buy x amount of the new token for our bnb
  transformedEnvs.amountIn = ethers.utils.parseUnits(
    `${transformedEnvs.AMOUNT_OF_BNB}`,
    "ether"
  );

  Object.entries(transformedEnvs).filter(([key, value]) => {
    if (value === undefined) {
      throw new Error(chalk.red(`Environment variable: ${key} is Undefined`));
    }
  });

  return transformedEnvs;
};

export default transformEnv;

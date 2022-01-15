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
  getLocalTimeStamp,
  getLatestBlock,
} from "../utils/index.js";
import {
  liqAddResValidator,
  honeyPotResValidator,
  buyEnabledCheckResValidator,
  buyResValidator,
  approveResValidator,
  sellResValidator,
  bookProfitResValidator,
} from "../validators/res/index.js";

import {
  honeyPotReqValidator,
  buyEnabledCheckReqValidator,
  buyReqValidator,
  approveReqValidator,
  sellReqValidator,
  bookProfitReqValidator,
} from "../validators/req/index.js";
import { botTitle, initializeStartPrompt } from "../console/index.js";

const envs = getEnv();
const { network, minBnb, mode, isTokenApproved } = envs;

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

            const iface = new ethers.utils.Interface([
              "function addLiquidityETH(address,uint256,uint256,uint256,address,uint256)",
            ]);

            const decodedInputData = iface.decodeFunctionData(
              "addLiquidityETH",
              transaction.data
            );

            console.log(
              "TransactionGas",
              transaction.gasPrice,
              transaction.gasLimit
            );

            console.log(
              "TransactionGasParsed",
              ethers.utils.formatUnits(transaction.gasPrice, "gwei"),
              ethers.utils.formatEther(transaction.gasLimit)
            );

            if (decodedInputData && decodedInputData[3]) {
              const liqAmtThatWillBeAdded = ethers.utils.formatEther(
                decodedInputData[3]
              );

              if (parseFloat(liqAmtThatWillBeAdded) > parseFloat(minBnb)) {
                if (mode === "0") {
                  const { isTokenBought, latestBlockNumber } = await buy({
                    ...getTradeFuncArgs(),
                    provider,
                    gasPriceM: transaction.gasPrice,
                    gasLimitM: transaction.gasLimit,
                  });
                }
                const providerGas = await provider.getGasPrice();
                console.log(
                  "🚀 LIQ ADD SUCCESSFULL!!",
                  "providerGas",
                  providerGas
                );
                console.log(
                  "🚀 LIQ ADD SUCCESSFULL!!",
                  "ParsedGas",
                  ethers.utils.parseUnits(`${providerGas}`, "gwei")
                );
                return;
              } else {
                console.log(
                  chalk.redBright(
                    `\nLiquidity did not meet min threshold | Liq to be added : ${chalk.white(
                      liqAmtThatWillBeAdded
                    )} | Min Liq to buy : ${chalk.white(minBnb)}`
                  )
                );
                process.exit();
              }
            } else {
              console.log(
                chalk.redBright(
                  `\nAdd Liquidity transaction does not have any LIQ AMOUNT to be added to Liq pool | Liq add transaction input data : ${chalk.white(
                    decodedInputData
                  )}`
                )
              );
              process.exit();
            }

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
    botTitle();

    await sleep(network === "TESTNET" ? 0 : 3000);

    initializeStartPrompt({ envs, account, provider });

    if (
      !globalObj.addLiqTransBlockNo ||
      globalObj.addLiqTransBlockNo.length === 0
    ) {
      globalObj.latestBlockNumber = await getLatestBlock(provider);
    }

    if (!globalObj.isLiqAdded) {
      const checkLiqAddRes = await checkLiqAdd(getTradeFuncArgs());
      const { isLiqAdded, isLiqGteMinExpectedLiq, totalLiq, spinner } =
        checkLiqAddRes;
      globalObj.isLiqAdded = isLiqAdded;
      globalObj.isLiqGteMinExpectedLiq = isLiqGteMinExpectedLiq;
      globalObj.totalLiq = totalLiq;
      globalObj.spinner = spinner;

      liqAddResValidator({
        ...checkLiqAddRes,
        latestBlockNumber: globalObj.latestBlockNumber,
      });
    }

    // if (!globalObj.isLiqAdded) {
    //   globalObj && globalObj.spinner && globalObj.spinner.stop();
    //   await scanMemPool();
    // }

    if (
      globalObj.addLiqTransBlockNo &&
      globalObj.addLiqTransBlockNo.length > 0
    ) {
      globalObj.latestBlockNumber = globalObj.addLiqTransBlockNo;
    }

    while (!globalObj.isLiqAdded || !globalObj.isLiqGteMinExpectedLiq) {
      if (!globalObj.isLiqAdded) {
        const checkLiqAddRes = await checkLiqAdd(getTradeFuncArgs());
        const { isLiqAdded, isLiqGteMinExpectedLiq, totalLiq, spinner } =
          checkLiqAddRes;
        globalObj.isLiqAdded = isLiqAdded;
        globalObj.isLiqGteMinExpectedLiq = isLiqGteMinExpectedLiq;
        globalObj.totalLiq = totalLiq;
        globalObj.spinner = spinner;

        liqAddResValidator({
          ...checkLiqAddRes,
          latestBlockNumber: globalObj.latestBlockNumber,
        });
      }
    }

    const checkHpReq = honeyPotReqValidator({
      envs,
      latestBlockNumber: globalObj.latestBlockNumber,
    });

    if (checkHpReq) {
      if (globalObj.isLiqAdded && !globalObj.isTokenBought) {
        const honeyPotCheckRes = await honeyPotCheck(getTradeFuncArgs());
        const { isTokenHoneyPot } = honeyPotCheckRes;
        globalObj.honeyPotCheck = isTokenHoneyPot;

        honeyPotResValidator({
          ...honeyPotCheckRes,
          latestBlockNumber: globalObj.latestBlockNumber,
          envs,
        });
      }
    }

    const checkBuyEnabledReq = buyEnabledCheckReqValidator({
      envs,
      latestBlockNumber: globalObj.latestBlockNumber,
    });

    if (checkBuyEnabledReq) {
      do {
        if (globalObj.isLiqAdded && !globalObj.isTokenBought) {
          const buyEnabledCheckRes = await buyEnabledCheck(getTradeFuncArgs());
          const { isBuyEnabled, error } = buyEnabledCheckRes;
          globalObj.isBuyEnabled = isBuyEnabled;
          globalObj.buyEnabledError = error;

          buyEnabledCheckResValidator({
            ...buyEnabledCheckRes,
            latestBlockNumber: globalObj.latestBlockNumber,
            envs,
          });
        }
      } while (!globalObj.isBuyEnabled && !globalObj.buyEnabledError);
    }

    if (globalObj.isLiqAdded && !globalObj.isTokenBought) {
      buyReqValidator({ latestBlockNumber: globalObj.latestBlockNumber });

      const buyRes = await buy(getTradeFuncArgs());
      const { isTokenBought, buyTxBlockNo } = buyRes;
      globalObj.isTokenBought = isTokenBought;
      globalObj.latestBlockNumber = buyTxBlockNo;

      buyResValidator({ ...buyRes });
    }

    if (
      globalObj.isLiqAdded &&
      globalObj.isTokenBought &&
      !globalObj.isTokenApproved
    ) {
      approveReqValidator({ latestBlockNumber: globalObj.latestBlockNumber });

      const approveRes = await approve(getTradeFuncArgs());
      const { isTokenApproved, approveTxBlockNo } = approveRes;
      globalObj.isTokenApproved = isTokenApproved;
      globalObj.latestBlockNumber = approveTxBlockNo;

      approveResValidator({ ...approveRes });
    }

    if (
      globalObj.isLiqAdded &&
      globalObj.isTokenBought &&
      globalObj.isTokenApproved &&
      !globalObj.isProfitBooked
    ) {
      bookProfitReqValidator({
        latestBlockNumber: globalObj.latestBlockNumber,
      });

      do {
        const bookProfitRes = await bookProfit(getTradeFuncArgs());
        const { isProfitBooked } = bookProfitRes;
        globalObj.isProfitBooked = isProfitBooked;

        bookProfitResValidator({
          ...bookProfitRes,
          latestBlockNumber: globalObj.latestBlockNumber,
        });
      } while (!globalObj.isProfitBooked);
    }

    if (
      globalObj.isLiqAdded &&
      globalObj.isTokenBought &&
      globalObj.isTokenApproved &&
      globalObj.isProfitBooked &&
      !globalObj.isTokenSold
    ) {
      sellReqValidator({ latestBlockNumber: globalObj.latestBlockNumber });

      const sellRes = await sell(getTradeFuncArgs());
      const { isTokenSold, sellTxBlockNo } = sellRes;
      globalObj.isTokenSold = isTokenSold;
      globalObj.latestBlockNumber = sellTxBlockNo;

      sellResValidator({
        ...sellRes,
      });
    }

    console.log(chalk.whiteBright(`\nSinpe done!!`));
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

export default tradeHandler;

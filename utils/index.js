import ethers from "ethers";
import Web3 from "web3";

import chalk from "chalk";
import inquirer from "inquirer";

import transformEnv from "../transformEnv.js";

const getEnv = () => {
  const envs = transformEnv();
  return envs;
};

const connectToChain = () => {
  try {
    const { mnemonic, wss } = getEnv();

    const provider = new ethers.providers.WebSocketProvider(wss);
    const wallet = new ethers.Wallet(mnemonic);
    const account = wallet.connect(provider);

    //W3 Provider
    const w3Provider = new Web3(new Web3.providers.WebsocketProvider(wss)); // WSS
    const web3 = new Web3(w3Provider);

    return { web3, account, provider };
  } catch (err) {
    console.log(chalk.red("\nBot unable to connect to Pancakeswap - BSC"));
    console.log(chalk.yellow("Please check....."));
    throw err;
  }
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const inquirerPrompt = async () => {
  const answers = await inquirer.prompt([
    {
      type: "confirm",
      name: "start",
      message: "Is config correct ? All good ?, start sniping ?",
    },
  ]);

  if (answers.start === true) {
    return { startSnipe: true };
  } else {
    return { startSnipe: false };
  }
};

const getLocalTimeStamp = () => {
  try {
    const dates = new Date();
    const months = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ];
    const month = months[dates.getMonth()];
    const year = dates.getFullYear();
    const date = dates.getDate();
    const hours = dates.getHours();
    const minutes = dates.getMinutes();
    const seconds = dates.getSeconds();
    const milliSeconds = dates.getMilliseconds();
    const timeStampWithSeconds = `${String(date).padStart(2, "0")}-${String(
      month
    ).padStart(2, "0")}-${year} ${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(
      milliSeconds
    ).padStart(3, "0")}`;
    return timeStampWithSeconds;
  } catch (err) {
    throw err;
  }
};

const loader = () => {
  var h = ["|", "/", "-", "\\"];
  var i = 0;

  return setInterval(() => {
    i = i > 3 ? 0 : i;
    console.clear();
    console.log(h[i]);
    i++;
  }, 300);
};

const getLatestBlock = async (provider) => {
  return await provider.getBlockNumber();
};

const logExitIfErrorCases = (params) => {
  const { error, envs } = params;
  const { exitIfError } = envs;

  if (error && exitIfError === "true") {
    console.log(
      chalk.yellow(`Exiting due to --> EXIT_IF_ERROR = ${exitIfError}`)
    );
    process.exit();
  } else if (error && exitIfError === "false") {
    console.log(
      chalk.yellow(`Continuing due to --> EXIT_IF_ERROR = ${exitIfError}`)
    );
  }
};

const getTxDeadLine = () => {
  const timeInHours = Date.now() + 1000 * 60;

  return {
    buy: timeInHours * 5,
    sell: timeInHours * 5,
    approve: timeInHours * 5,
  };
};

export {
  connectToChain,
  getEnv,
  sleep,
  inquirerPrompt,
  getLocalTimeStamp,
  loader,
  getLatestBlock,
  logExitIfErrorCases,
  getTxDeadLine,
};

// -------------------------------------------------------------------------------------------------

// GET RESERVES UTIL

// const pairABI = [
//   "function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
// ];

// let pairContract = new ethers.Contract(pairAddress, pairABI, provider);
// console.log("🚀 ~ file: liqAdd.js ~ line 40 ~ checkLiqAdd ~ pairContract");
// let reserves = await pairContract.getReserves();
//

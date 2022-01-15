import chalk from "chalk";
import { inquirerPrompt } from "../../utils/index.js";

import { getLocalTimeStamp, getLatestBlock } from "../../utils/index.js";

const divider = () => {
  console.log(chalk.yellow(`--------------------------------------------`));
};

const botTitle = (params) => {
  console.log(
    chalk.yellow(`============ NICK BOT VERSION BETA v1.0.0.1000 ============`)
  );
};

const initializeStartPrompt = async (params) => {
  const { envs, account, provider } = params;
  const { chain, network, exchange, isTokenApproved, cliViewObjs } = envs;

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
  console.log(chalk.whiteBright(`Amount for purchase - ${envs.AMOUNT_OF_BNB}`));
  console.log(chalk.whiteBright(`Slippage percent- ${envs.Slippage}`));
  console.log(chalk.whiteBright(`Liquidity minimum - ${envs.minBnb}`));
  console.log(chalk.whiteBright(`Buy | Sell GWEI - ${cliViewObjs.gwei}`));
  console.log(chalk.whiteBright(`Buy | Sell GASLIMIT - ${envs.gasLimit}`));
  console.log(chalk.whiteBright(`Token approved already - ${isTokenApproved}`));
  console.log(chalk.whiteBright(`Buy trade check - ${envs.checkIfBuyEnabled}`));
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
};

export { divider, botTitle, initializeStartPrompt };

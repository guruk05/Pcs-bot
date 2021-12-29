import chalk from "chalk";

const honeyPotCheck = async ({ envs, exchanges }) => {
  const { tokenOut, maxBuyTax, maxSellTax } = envs;

  const { bscSwapper } = exchanges;

  const res = {
    isTokenHoneyPot: false,
    error: false,
  };

  try {
    console.log(chalk.green.inverse(`Processing Honeypot check.....`));

    const tokenInfos = await bscSwapper.methods.getTokenInfos(tokenOut).call();

    const buy_tax = Math.round(
      ((tokenInfos[0] - tokenInfos[1]) / tokenInfos[0]) * 100
    );
    const sell_tax = Math.round(
      ((tokenInfos[2] - tokenInfos[3]) / tokenInfos[2]) * 100
    );

    if (tokenInfos[5] && tokenInfos[6]) {
      console.log(chalk.green("\n[DONE] Token is NOT a Honeypot!"));
      res.isTokenHoneyPot = false;
    } else {
      console.log(chalk.red("\nToken is Honeypot, exiting"));
      res.isTokenHoneyPot = true;
    }

    if (buy_tax > maxBuyTax) {
      res.isTokenHoneyPot = true;
      console.log(
        chalk.red(
          `\nBuyTax: ${chalk.yellow(
            buy_tax
          )} Token BuyTax exceeds maxBuyTax, exiting!`
        )
      );
    }

    if (sell_tax > maxSellTax) {
      res.isTokenHoneyPot = true;
      console.log(
        chalk.red(
          `\nSellTax: ${chalk.yellow(
            sell_tax
          )} Token SellTax exceeds SellTax, exiting!`
        )
      );
    }

    return res;
  } catch (err) {
    console.log(
      chalk.red(
        `\nHoneyPot Checker ${chalk.yellow(
          `is Unable to validate this contract`
        )}`,
        `\nContract Address: ${tokenOut}`,
        `\nError: ${chalk.red(JSON.parse(JSON.stringify(err)))}`
      )
    );
    res.error = true;
    return res;
  }
};

export default honeyPotCheck;

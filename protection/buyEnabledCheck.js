import chalk from "chalk";

const buyEnabledCheck = async ({ envs, exchanges }) => {
  const { tokenOut } = envs;

  const { bscSwapper } = exchanges;

  const res = {
    isBuyEnabled: false,
    error: false,
  };

  try {
    const tokenInfo = await bscSwapper.methods.getTokenInfos(tokenOut).call();

    res.isBuyEnabled = tokenInfo[4];

    return res;
  } catch (err) {
    console.log(chalk.red(`\nBuy enabled check failed`));
    res.error = true;
    return res;
  }
};

export default buyEnabledCheck;

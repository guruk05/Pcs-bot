import chalk from "chalk";
import ethers from "ethers";

const sell = async ({ envs, exchanges }) => {
  const {
    tokenIn,
    tokenOut,
    recipient,
    Slippage,
    gasLimit,
    gasPrice,
    explorerUrl,
  } = envs;
  const { router, purchasedToken } = exchanges;

  try {
    let amountsOutMin = 0;
    let amounts;

    const bal = await purchasedToken.balanceOf(recipient);

    //We buy x amount of the new token for our bnb
    if (parseInt(Slippage) !== 0) {
      amounts = await router.getAmountsOut(bal, [tokenOut, tokenIn]);
      //Our execution price will be a bit different, we need some flexibility
      amountsOutMin = amounts[1].sub(amounts[1].div(`${Slippage}`));
    }

    const amountInMin = ethers.utils.formatUnits(amounts[1]);

    console.log(
      chalk.green.inverse(`\nProcessing sell \n`) +
        `Selling Token
        =================
        tokenOut: ${ethers.utils.formatUnits(bal)} ${tokenOut}
        tokenIn: ${amountInMin.toString()} ${tokenIn} (BNB)
      `
    );

    console.log(chalk.yellow("Processing Sell Transaction....."));
    console.log(chalk.yellow(`amountInMin: ${amountInMin} ${tokenIn} (BNB)`));
    console.log(chalk.yellow(`amountsOutMin: ${amountsOutMin}`));
    console.log(chalk.yellow(`tokenOut: ${tokenOut}`));
    console.log(chalk.yellow(`tokenIn: ${tokenIn}`));
    console.log(chalk.yellow(`recipient: ${recipient}`));
    console.log(chalk.yellow(`gasLimit: ${gasLimit}`));
    console.log(chalk.yellow(`gasPrice: ${gasPrice} \n`));

    // const tx = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens( //uncomment this if you want to buy deflationary token
    const tx = await router.swapExactTokensForETH(
      amounts[0],
      amountsOutMin,
      [tokenOut, tokenIn],
      recipient,
      Date.now() + 1000 * 60 * 5, //5 minutes
      {
        gasLimit: gasLimit,
        gasPrice: gasPrice,
      }
    );

    const receipt = await tx.wait();

    console.log(
      chalk.yellow(
        chalk.greenBright(`Successfully sold the token`),
        `\nTransaction receipt : ${explorerUrl}/tx/${receipt.logs[1].transactionHash}`,
        `\nBlocknumber: ${receipt.blockNumber} - ${explorerUrl}/block/${receipt.blockNumber}`,
        `\nBlockhash: ${receipt.blockHash} - ${explorerUrl}/block/${receipt.blockHash}\n`
      )
    );

    return { isTokenSold: true };
  } catch (err) {
    const error = JSON.parse(JSON.stringify(err));
    console.log(chalk.red(error));
  }
};

export default sell;

import chalk from "chalk";

const buy = async ({ envs, exchanges }) => {
  const {
    tokenIn,
    tokenOut,
    recipient,
    Slippage,
    gasLimit,
    gasPrice,
    amountIn,
    explorerUrl,
  } = envs;
  const { router } = exchanges;

  try {
    let amountOutMin = 0;
    //We buy x amount of the new token for our bnb
    if (parseInt(Slippage) !== 0) {
      const amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut]);
      //Our execution price will be a bit different, we need some flexibility
      amountOutMin = amounts[1].sub(amounts[1].div(`${Slippage}`));
    }

    console.log(
      chalk.green.inverse(`Processing buy \n`) +
        `Buying Token
        =================
        tokenIn: ${(amountIn * 1e-18).toString()} ${tokenIn} (BNB)
        tokenOut: ${amountOutMin.toString()} ${tokenOut}
      `
    );

    console.log(chalk.yellow("Processing Buy Transaction....."));
    console.log(chalk.yellow(`amountIn: ${amountIn * 1e-18} ${tokenIn} (BNB)`));
    console.log(chalk.yellow(`amountOutMin: ${amountOutMin}`));
    console.log(chalk.yellow(`tokenIn: ${tokenIn}`));
    console.log(chalk.yellow(`tokenOut: ${tokenOut}`));
    console.log(chalk.yellow(`recipient: ${recipient}`));
    console.log(chalk.yellow(`gasLimit: ${gasLimit}`));
    console.log(chalk.yellow(`gasPrice: ${gasPrice} \n`));

    // const tx = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens( //uncomment this if you want to buy deflationary token
    const tx = await router.swapETHForExactTokens(
      amountOutMin,
      [tokenIn, tokenOut],
      recipient,
      Date.now() + 1000 * 60 * 5, //5 minutes
      {
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        nonce: null, //set you want buy at where position in blocks
        value: amountIn,
      }
    );

    const receipt = await tx.wait();

    console.log(
      chalk.yellow(
        chalk.greenBright(`Successfully bought the token`),
        `\nTransaction receipt : ${explorerUrl}/tx/${receipt.logs[1].transactionHash}`,
        `\nBlocknumber: ${receipt.blockNumber} - ${explorerUrl}/block/${receipt.blockNumber}`,
        `\nBlockhash: ${receipt.blockHash} - ${explorerUrl}/block/${receipt.blockHash}`
      )
    );

    return { isTokenBought: true };
  } catch (err) {
    const error = JSON.parse(JSON.stringify(err));
    console.log(chalk.red(error));
  }
};

export default buy;

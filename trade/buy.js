import chalk from "chalk";
import { getLocalTimeStamp } from "../utils/index.js";

const buy = async ({ envs, exchanges, latestBlockNumber }) => {
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
      chalk.whiteBright(
        `${getLocalTimeStamp()} | Block : ${latestBlockNumber} | Buying`
      )
    );

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
      chalk.green(
        `${getLocalTimeStamp()} | Block : ${
          receipt.blockNumber
        } | Buy successful!!`,
        chalk.white(
          `\nTransaction URL : ${explorerUrl}/tx/${receipt.logs[1].transactionHash}`
        )
      )
    );

    return { isTokenBought: true, latestBlockNumber: receipt.blockNumber };
  } catch (err) {
    throw err;
  }
};

export default buy;

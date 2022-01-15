import { getTxDeadLine } from "../utils/index.js";

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

    // const tx = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens( //uncomment this if you want to buy deflationary token
    const tx = await router.swapExactTokensForETH(
      amounts[0],
      amountsOutMin,
      [tokenOut, tokenIn],
      recipient,
      getTxDeadLine().sell,
      {
        gasLimit: gasLimit,
        gasPrice: gasPrice,
      }
    );

    const receipt = await tx.wait();

    return {
      isTokenSold: true,
      sellTxBlockNo: receipt.blockNumber,
      transactionUrl: `${explorerUrl}/tx/${receipt.logs[1].transactionHash}`,
    };
  } catch (err) {
    throw err;
  }
};

export default sell;

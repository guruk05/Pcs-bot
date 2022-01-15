import { getTxDeadLine } from "../utils/index.js";

const buy = async ({ envs, exchanges, provider, gasPriceM, gasLimitM }) => {
  const {
    tokenIn,
    tokenOut,
    recipient,
    Slippage,
    gasLimit,
    gasPrice,
    amountIn,
    explorerUrl,
    mode,
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

    // const tx = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens( //uncomment this if you want to buy deflationary token
    const tx = await router.swapETHForExactTokens(
      amountOutMin,
      [tokenIn, tokenOut],
      recipient,
      getTxDeadLine().buy,
      {
        gasLimit: mode === "0" ? "400000" : gasLimit,
        gasPrice: mode === "0" ? await provider.getGasPrice() : gasPrice,
        nonce: null, //set you want buy at where position in blocks
        value: amountIn,
      }
    );

    const receipt = await tx.wait();

    return {
      isTokenBought: true,
      buyTxBlockNo: receipt.blockNumber,
      transactionUrl: `${explorerUrl}/tx/${receipt.logs[1].transactionHash}`,
    };
  } catch (err) {
    throw err;
  }
};

export default buy;

import ethers from "ethers";

const globalObj = {
  isTokenBalFetched: false,
  tokenBal: 0,
};

const bookProfit = async ({ envs, exchanges }) => {
  const { recipient, tokenIn, tokenOut, amountIn, profitXamount } = envs;
  const { router, purchasedToken } = exchanges;

  try {
    if (!globalObj.isTokenBalFetched) {
      globalObj.tokenBal = await purchasedToken.balanceOf(recipient);
      globalObj.isTokenBalFetched = true;
    }

    const amount = await router.getAmountsOut(globalObj.tokenBal, [
      tokenOut,
      tokenIn,
    ]);
    const profitDesired = amountIn.mul(profitXamount);
    const currentValue = amount[1];

    const formattedCurrentVal = ethers.utils.formatUnits(currentValue);
    const formattedDesiredProfit = ethers.utils.formatUnits(profitDesired);

    if (currentValue.gte(profitDesired)) {
      return {
        isProfitBooked: true,
        currentValue: formattedCurrentVal,
        profitDesired: formattedDesiredProfit,
      };
    } else {
      return {
        isProfitBooked: false,
        currentValue: formattedCurrentVal,
        profitDesired: formattedDesiredProfit,
      };
    }
  } catch (err) {
    throw err;
  }
};

export default bookProfit;

import ethers from "ethers";
import chalk from "chalk";

const bookProfit = async ({ envs, exchanges }) => {
  const { recipient, tokenIn, tokenOut, amountIn, profitXamount } = envs;
  const { router, purchasedToken } = exchanges;

  try {
    console.log(chalk.green.inverse(`\nProcessing profit booking.....`));

    const bal = await purchasedToken.balanceOf(recipient);
    console.log(
      "🚀 ~ file: bookProfit.js ~ line 12 ~ bookProfit ~ bal",
      ethers.utils.formatUnits(bal),
      profitXamount
    );

    const amount = await router.getAmountsOut(bal, [tokenOut, tokenIn]);
    const profitDesired = amountIn.mul(profitXamount);
    const currentValue = amount[1];
    console.log("🚀 ~ profitXamount", profitDesired);

    const formattedCurrentVal = ethers.utils.formatUnits(currentValue);
    const formattedDesiredProfit = ethers.utils.formatUnits(profitDesired);

    console.log(
      chalk.green(
        `Current Price:
      ${formattedCurrentVal}`,
        `\nProfit Wanted:
      ${formattedDesiredProfit}`
      )
    );

    if (currentValue.gte(profitDesired)) {
      console.log(
        chalk.green(
          `\n${chalk.yellow(`Profit booked successfully`)}`,
          `\nProfit booked at ${formattedCurrentVal}`
        )
      );
      return { isProfitBooked: true };
    } else {
      console.log(
        chalk.green(
          `\nWaiting to book profit\n`,
          `\nCurrent value: ${formattedCurrentVal}`,
          `\nProfit Desired: ${formattedDesiredProfit}`
        )
      );
      return { isProfitBooked: false };
    }
  } catch (err) {
    throw err;
  }
};

export default bookProfit;

import ethers from "ethers";
import chalk from "chalk";
import { getLocalTimeStamp } from "../utils/index.js";
import { Spinner } from "cli-spinner";

let isConsolePrinted = false;

const spinner = new Spinner(
  chalk.whiteBright(`Waiting for min liq... stop bot ? ctrl + c %s`)
);
spinner.setSpinnerString("|/-\\");

const bookProfit = async ({ envs, exchanges, latestBlockNumber }) => {
  const { recipient, tokenIn, tokenOut, amountIn, profitXamount } = envs;
  const { router, purchasedToken } = exchanges;

  try {
    const bal = await purchasedToken.balanceOf(recipient);
    // console.log(
    //   "🚀 ~ file: bookProfit.js ~ line 12 ~ bookProfit ~ bal",
    //   ethers.utils.formatUnits(bal),
    //   profitXamount
    // );

    const amount = await router.getAmountsOut(bal, [tokenOut, tokenIn]);
    const profitDesired = amountIn.mul(profitXamount);
    const currentValue = amount[1];
    // console.log("🚀 ~ profitXamount", profitDesired);

    const formattedCurrentVal = ethers.utils.formatUnits(currentValue);
    const formattedDesiredProfit = ethers.utils.formatUnits(profitDesired);

    if (!isConsolePrinted) {
      console.log(
        chalk.whiteBright(
          `${getLocalTimeStamp()} | Block : ${latestBlockNumber} | Booking profit`
        )
      );
    }

    isConsolePrinted = true;

    if (currentValue.gte(profitDesired)) {
      console.log(
        chalk.green(
          `${getLocalTimeStamp()} | Block : ${latestBlockNumber} | Current price : ${chalk.white(
            formattedCurrentVal
          )} | Profit Booked!!`
        )
      );
      return { isProfitBooked: true };
    } else {
      console.log(
        chalk.whiteBright(
          `${getLocalTimeStamp()} | Block : ${latestBlockNumber} | Current price : ${formattedCurrentVal} | Profit target : ${formattedDesiredProfit}`
        )
      );
      return { isProfitBooked: false };
    }
  } catch (err) {
    throw err;
  }
};

export default bookProfit;

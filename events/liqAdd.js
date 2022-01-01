import ethers from "ethers";
import chalk from "chalk";
import { Spinner } from "cli-spinner";

import { loader } from "../utils/index.js";

let isConsolePrinted = false;
let prevTotalLiq = 0;

const spinner = new Spinner(
  chalk.whiteBright(`Rerunning liquidity check... %s`)
);
spinner.setSpinnerString("|/-\\");

const checkLiqAdd = async ({ envs, exchanges }) => {
  const { tokenIn, tokenOut, minBnb } = envs;
  const { factory, erc } = exchanges;

  let jmlBnb = 0;

  try {
    const pairAddressx = await factory.getPair(tokenIn, tokenOut);
    if (pairAddressx) {
      if (pairAddressx.toString().indexOf("0x0000000000000") > -1) {
        return { isLiqAdded: false, isLiqGteMinExpectedLiq: false };
      }
    }

    const pairBNBvalue = await erc.balanceOf(pairAddressx);
    jmlBnb = await ethers.utils.formatEther(pairBNBvalue);

    if (jmlBnb !== prevTotalLiq) {
      console.log(
        "🚀 ~ file: liqAdd.js ~ line 33 ~ checkLiqAdd ~ prevTotalLiq",
        prevTotalLiq
      );
      clearInterval(loader);
      isConsolePrinted = false;
    }

    prevTotalLiq = jmlBnb;

    if (parseFloat(jmlBnb) > parseFloat(minBnb)) {
      spinner.stop();
      return {
        isLiqAdded: true,
        isLiqGteMinExpectedLiq: true,
        totalLiq: jmlBnb,
      };
    } else {
      if (!isConsolePrinted) {
        console.log(
          chalk.redBright(
            `\nPair Liquidity did not meet min threshold | Current Liq : ${jmlBnb}`
          )
        );
        spinner.start();
        isConsolePrinted = true;
      }

      return {
        isLiqAdded: false,
        isLiqGteMinExpectedLiq: false,
        totalLiq: jmlBnb,
      };
    }
  } catch (err) {
    throw err;
  }
};

export default checkLiqAdd;

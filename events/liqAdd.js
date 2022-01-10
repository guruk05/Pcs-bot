import ethers from "ethers";
import chalk from "chalk";
import { Spinner } from "cli-spinner";

let isConsolePrinted = false;
let prevTotalLiq = 0;

const spinner = new Spinner(
  chalk.whiteBright(`Waiting for min liq... stop bot ? ctrl + c %s`)
);
spinner.setSpinnerString("|/-\\");

const checkLiqAdd = async ({ envs, exchanges }) => {
  const { tokenIn, tokenOut, minBnb } = envs;
  const { factory, erc } = exchanges;

  let jmlBnb = 0;

  try {
    const pairAddress = await factory.getPair(tokenIn, tokenOut);
    // console.log(
    //   "🚀 ~ file: liqAdd.js ~ line 23 ~ checkLiqAdd ~ pairAddress",
    //   pairAddress
    // );
    if (pairAddress) {
      if (pairAddress.toString().indexOf("0x0000000000000") > -1) {
        return {
          isLiqAdded: false,
          isLiqGteMinExpectedLiq: false,
          totalLiq: 0,
          pairAddress: null,
        };
      }
    }

    const pairBNBvalue = await erc.balanceOf(pairAddress);
    jmlBnb = await ethers.utils.formatEther(pairBNBvalue);

    // console.log(
    //   "🚀 ~ file: liqAdd.js ~ line 43 ~ checkLiqAdd ~ reserves(1)",
    //   ethers.utils.formatEther(reserves[0]),
    //   ethers.utils.formatEther(reserves[1]),
    //   ethers.utils.formatEther(reserves[2]),
    //   "total liquidity" + ":" + reserves[0] + reserves[1]
    // );

    // console.log(
    //   "🚀 ~ file: liqAdd.js ~ line 33 ~ checkLiqAdd ~ prevTotalLiq",
    //   prevTotalLiq,
    //   "currentLiq" + " : " + jmlBnb,
    //   typeof jmlBnb
    // );

    if (jmlBnb !== prevTotalLiq) {
      isConsolePrinted = false;
    }

    if (!parseFloat(jmlBnb) > 0) {
      return {
        isLiqAdded: false,
        isLiqGteMinExpectedLiq: false,
        totalLiq: 0,
        pairAddress,
      };
    }

    prevTotalLiq = jmlBnb;

    if (parseFloat(jmlBnb) > parseFloat(minBnb)) {
      spinner.stop();
      return {
        isLiqAdded: true,
        isLiqGteMinExpectedLiq: true,
        totalLiq: jmlBnb,
        pairAddress,
      };
    } else {
      if (!isConsolePrinted) {
        console.log(
          chalk.redBright(
            `\nPair Liquidity did not meet min threshold | Current Liq : ${chalk.white(
              jmlBnb
            )} | Min Liq to snipe : ${chalk.white(minBnb)}`
          )
        );
        spinner.start();
        isConsolePrinted = true;
      }

      return {
        isLiqAdded: false,
        isLiqGteMinExpectedLiq: false,
        totalLiq: jmlBnb,
        pairAddress,
        spinner,
      };
    }
  } catch (err) {
    throw err;
  }
};

export default checkLiqAdd;

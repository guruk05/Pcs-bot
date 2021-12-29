import ethers from "ethers";
import chalk from "chalk";

const checkLiqAdd = async ({ envs, exchanges }) => {
  const { tokenIn, tokenOut, minBnb } = envs;
  const { factory, erc } = exchanges;

  let jmlBnb = 0;

  try {
    const pairAddressx = await factory.getPair(tokenIn, tokenOut);
    if (pairAddressx) {
      if (pairAddressx.toString().indexOf("0x0000000000000") > -1) {
        console.log(chalk.cyan(`\nPair not detected. Auto restart`));
        return { isLiqAdded: false, isLiqGteMinExpectedLiq: false };
      }
    }

    console.log(
      chalk.cyan(
        `\npair exists`,
        `\npairAddress: ${pairAddressx}`,
        `\nListening for liquidity addition of pair: ${pairAddressx}`
      )
    );

    const pairBNBvalue = await erc.balanceOf(pairAddressx);
    jmlBnb = await ethers.utils.formatEther(pairBNBvalue);

    console.log(
      chalk.cyan(
        `\nPair liquidity value in : ${jmlBnb}`,
        `\nValidating liquidity...`
      )
    );

    if (parseFloat(jmlBnb) > parseFloat(minBnb)) {
      console.log(
        chalk.yellowBright(`\nLiquidity validation successfull : ${jmlBnb}`)
      );
      return { isLiqAdded: true, isLiqGteMinExpectedLiq: true };
    } else {
      console.log(
        chalk.redBright(
          `\nPair Liquidity did not meet min threshold : ${jmlBnb}`,
          `\nRerunning liquidity check`
        )
      );

      return { isLiqAdded: false, isLiqGteMinExpectedLiq: false };
    }
  } catch (err) {
    let error = JSON.parse(JSON.stringify(err));
    console.log(chalk.red(error));
  }
};

export default checkLiqAdd;

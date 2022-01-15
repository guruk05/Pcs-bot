import ethers from "ethers";

const checkLiqAdd = async ({ envs, exchanges }) => {
  const { tokenIn, tokenOut, minBnb } = envs;
  const { factory, erc } = exchanges;

  let jmlBnb = 0;

  try {
    const pairAddress = await factory.getPair(tokenIn, tokenOut);
    if (pairAddress) {
      if (pairAddress.toString().indexOf("0x0000000000000") > -1) {
        return {
          isLiqAdded: false,
          isLiqGteMinExpectedLiq: false,
          totalLiq: 0,
          pairAddress: null,
          minBnb,
        };
      }
    }

    const pairBNBvalue = await erc.balanceOf(pairAddress);
    jmlBnb = ethers.utils.formatEther(pairBNBvalue);

    if (!parseFloat(jmlBnb) > 0) {
      return {
        isLiqAdded: false,
        isLiqGteMinExpectedLiq: false,
        totalLiq: 0,
        pairAddress,
        minBnb,
      };
    }

    if (parseFloat(jmlBnb) > parseFloat(minBnb)) {
      return {
        isLiqAdded: true,
        isLiqGteMinExpectedLiq: true,
        totalLiq: jmlBnb,
        pairAddress,
        minBnb,
      };
    } else {
      return {
        isLiqAdded: false,
        isLiqGteMinExpectedLiq: false,
        totalLiq: jmlBnb,
        pairAddress,
        minBnb,
      };
    }
  } catch (err) {
    throw err;
  }
};

export default checkLiqAdd;

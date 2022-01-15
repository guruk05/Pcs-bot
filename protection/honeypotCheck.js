const honeyPotCheck = async ({ envs, exchanges }) => {
  const { tokenOut, maxBuyTax, maxSellTax } = envs;

  const { bscSwapper } = exchanges;

  const res = {
    isTokenHoneyPot: false,
    error: false,
    approve: false,
    sell: false,
    buyTax: 0,
    sellTax: 0,
    isBuyTaxGteMaxBuyTax: false,
    isSellTaxGteMaxSellTax: false,
  };

  try {
    const tokenInfos = await bscSwapper.methods.getTokenInfos(tokenOut).call();

    const buy_tax = Math.round(
      ((tokenInfos[0] - tokenInfos[1]) / tokenInfos[0]) * 100
    );
    const sell_tax = Math.round(
      ((tokenInfos[2] - tokenInfos[3]) / tokenInfos[2]) * 100
    );

    if (tokenInfos[5] && tokenInfos[6]) {
      res.isTokenHoneyPot = false;
      res.approve = true;
      res.sell = true;
    } else {
      res.isTokenHoneyPot = true;
      res.approve = false;
      res.sell = false;
    }

    if (buy_tax > maxBuyTax) {
      res.isTokenHoneyPot = true;
      res.buyTax = buy_tax;
      res.isBuyTaxGteMaxBuyTax = true;
    }

    if (sell_tax > maxSellTax) {
      res.isTokenHoneyPot = true;
      res.sellTax = sell_tax;
      res.isSellTaxGteMaxSellTax = true;
    }

    return res;
  } catch (err) {
    res.error = true;
    res.errorMessage = err;
    return res;
  }
};

export default honeyPotCheck;

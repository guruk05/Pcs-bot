import chalk from "chalk";
import Web3 from "web3";

const honeyPotCheck = async ({ envs }) => {
  const { tokenOut, maxBuyTax, maxSellTax, wss, honeyPotCheckerAddress } = envs;

  const abi = [
    {
      inputs: [
        {
          internalType: "address",
          name: "Token",
          type: "address",
        },
      ],
      name: "getTokenInfos",
      outputs: [
        {
          internalType: "uint256",
          name: "BuyEstimateOutput",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "BuyRealOutput",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "SellEstimateOutput",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "SellRealOutput",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "Buy",
          type: "bool",
        },
        {
          internalType: "bool",
          name: "Approve",
          type: "bool",
        },
        {
          internalType: "bool",
          name: "Sell",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const res = {
    isTokenHoneyPot: false,
  };

  try {
    console.log(chalk.green.inverse(`Processing Honeypot check.....`));

    const provider = new Web3(new Web3.providers.WebsocketProvider(wss)); // WSS

    const web3 = new Web3(provider);

    const honeyPotContractBk = new web3.eth.Contract(
      abi,
      honeyPotCheckerAddress
    );

    const tokenInfos = await honeyPotContractBk.methods
      .getTokenInfos(tokenOut)
      .call();

    const buy_tax = Math.round(
      ((tokenInfos[0] - tokenInfos[1]) / tokenInfos[0]) * 100
    );
    const sell_tax = Math.round(
      ((tokenInfos[2] - tokenInfos[3]) / tokenInfos[2]) * 100
    );

    if (tokenInfos[5] && tokenInfos[6]) {
      console.log(chalk.green("\n[DONE] Token is NOT a Honeypot!"));
      res.isTokenHoneyPot = false;
    } else {
      console.log(chalk.red("\nToken is Honeypot, exiting"));
      res.isTokenHoneyPot = true;
    }

    if (buy_tax > maxBuyTax) {
      res.isTokenHoneyPot = true;
      console.log(
        chalk.red(
          `\nBuyTax: ${chalk.yellow(
            buy_tax
          )} Token BuyTax exceeds maxBuyTax, exiting!`
        )
      );
    }

    if (sell_tax > maxSellTax) {
      res.isTokenHoneyPot = true;
      console.log(
        chalk.red(
          `\nSellTax: ${chalk.yellow(
            sell_tax
          )} Token SellTax exceeds SellTax, exiting!`
        )
      );
    }

    return res;
  } catch (err) {
    console.log(
      chalk.red(
        `\nHoneyPot Checker ${chalk.yellow(
          `is Unable to validate this contract`
        )}`,
        `\nContract Address: ${tokenOut}`,
        `\nError: ${chalk.red(JSON.parse(JSON.stringify(err)))}`
      )
    );
    return res;
  }
};

export default honeyPotCheck;

import ethers from "ethers";
import chalk from "chalk";

import { bscSwapper as bscSwapperAbi } from "../abis/index.js";

const initializeExchange = ({ account, envs, web3 }) => {
  const {
    factoryAddress,
    routerAddress,
    bnbAddress,
    honeyPotCheckerAddress,
    purchaseTokenAddress,
  } = envs;

  const factory = new ethers.Contract(
    factoryAddress,
    [
      "event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
      "function getPair(address tokenA, address tokenB) external view returns (address pair)",
    ],
    account
  );

  const router = new ethers.Contract(
    routerAddress,
    [
      "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      "function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external  payable returns (uint[] memory amounts)",
      "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
      "function approve(address _spender, uint256 _value) public returns (bool success)",
    ],
    account
  );

  const erc = new ethers.Contract(
    bnbAddress,
    [
      {
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        payable: false,
        type: "function",
      },
    ],
    account
  );

  const bscSwapper = new web3.eth.Contract(
    bscSwapperAbi,
    honeyPotCheckerAddress
  );

  const purchasedToken = new ethers.Contract(
    purchaseTokenAddress,
    [
      "function approve(address spender, uint amount) public returns(bool)",
      "function balanceOf(address account) external view returns (uint256)",
      "function decimals() external view returns (uint8)",
      "event Transfer(address indexed from, address indexed to, uint amount)",
      "function transfer(address to, uint amount) returns (bool)",
    ],
    account
  );

  const exchange = {
    factory,
    router,
    erc,
    purchasedToken,
    bscSwapper,
  };

  Object.entries(exchange).filter(([key, value]) => {
    if (
      !value ||
      typeof value !== "object" ||
      Object.keys(value).length === 0
    ) {
      throw new Error(
        chalk.red(
          `Exchange: ${key} is not initialized properly, value of ${key}: ${value}`
        )
      );
    }
  });

  return exchange;
};

export default initializeExchange;

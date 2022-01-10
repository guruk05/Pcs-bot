import ethers from "ethers";
import chalk from "chalk";
import { getLocalTimeStamp } from "../utils/index.js";

const approve = async ({ envs, exchanges, latestBlockNumber }) => {
  const { tokenOut, routerAddress, explorerUrl } = envs;
  const { purchasedToken } = exchanges;

  try {
    console.log(
      chalk.whiteBright(
        `${getLocalTimeStamp()} | Block : ${latestBlockNumber} | Approving`
      )
    );

    const tx = await purchasedToken.approve(
      routerAddress,
      ethers.constants.MaxUint256,
      {
        gasLimit: 200000,
        gasPrice: ethers.utils.parseUnits(`${10}`, "gwei"),
      }
    );
    const receipt = await tx.wait();

    console.log(
      chalk.green(
        `${getLocalTimeStamp()} | Block : ${
          receipt.blockNumber
        } | Approve successful!!`
      )
    );

    return { isTokenApproved: true, latestBlockNumber: receipt.blockNumber };
  } catch (err) {
    throw err;
  }
};

export default approve;

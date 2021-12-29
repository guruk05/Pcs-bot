import ethers from "ethers";
import chalk from "chalk";

const approve = async ({ envs, exchanges }) => {
  const { tokenOut, routerAddress, explorerUrl } = envs;
  const { purchasedToken } = exchanges;

  try {
    console.log(chalk.green.inverse(`\nProcessing Approval.....`));

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
      chalk.magenta(
        `${chalk.yellow(`Approved`)} ${tokenOut}`,
        `\nToken Approval TxHash: ${receipt.transactionHash}`,
        `\nApproved Transaction receipt : ${explorerUrl}/tx/${receipt.transactionHash}`
      )
    );

    return { isTokenApproved: true };
  } catch (err) {
    const error = JSON.parse(JSON.stringify(err));
    console.log(chalk.red(error));
  }
};

export default approve;

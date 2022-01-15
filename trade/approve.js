import ethers from "ethers";

const approve = async ({ envs, exchanges }) => {
  const { routerAddress } = envs;
  const { purchasedToken } = exchanges;

  try {
    const tx = await purchasedToken.approve(
      routerAddress,
      ethers.constants.MaxUint256,
      {
        gasLimit: 200000,
        gasPrice: ethers.utils.parseUnits(`${10}`, "gwei"),
      }
    );
    const receipt = await tx.wait();

    return {
      isTokenApproved: true,
      approveTxBlockNo: receipt.blockNumber,
    };
  } catch (err) {
    throw err;
  }
};

export default approve;

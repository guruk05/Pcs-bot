import chalk from "chalk";

import { divider } from "../../console/index.js";
import { getLocalTimeStamp } from "../../utils/index.js";

const liqAddReqValidator = (params) => {};

const honeyPotReqValidator = (params) => {
  const { envs, latestBlockNumber } = params;
  const { checkHoneyPot } = envs;

  if (checkHoneyPot === "true") {
    divider();

    console.log(
      chalk.whiteBright(
        `${getLocalTimeStamp()} | Block : ${
          latestBlockNumber ? latestBlockNumber : "Pending"
        } | Checking for HoneyPot`
      )
    );
    return true;
  }
  return false;
};

const buyEnabledCheckReqValidator = (params) => {
  const { envs, latestBlockNumber } = params;
  const { checkIfBuyEnabled } = envs;

  if (checkIfBuyEnabled) {
    divider();

    console.log(
      chalk.whiteBright(
        `${getLocalTimeStamp()} | Block : ${
          latestBlockNumber ? latestBlockNumber : "Pending"
        } | Checking/Waiting for Buy to be Enabled`
      )
    );
    return true;
  }
  return false;
};

const buyReqValidator = (params) => {
  const { latestBlockNumber } = params;
  divider();

  console.log(
    chalk.whiteBright(
      `${getLocalTimeStamp()} | Block : ${
        latestBlockNumber ? latestBlockNumber : "Pending"
      } | Buying`
    )
  );
};

const approveReqValidator = (params) => {
  const { latestBlockNumber } = params;
  divider();

  console.log(
    chalk.whiteBright(
      `${getLocalTimeStamp()} | Block : ${
        latestBlockNumber ? latestBlockNumber : "Pending"
      } | Approving`
    )
  );
};

const bookProfitReqValidator = (params) => {
  const { latestBlockNumber } = params;
  divider();

  console.log(
    chalk.whiteBright(
      `${getLocalTimeStamp()} | Block : ${
        latestBlockNumber ? latestBlockNumber : "Pending"
      } | Booking profit`
    )
  );
};

const sellReqValidator = (params) => {
  const { latestBlockNumber } = params;
  divider();

  console.log(
    chalk.whiteBright(
      `${getLocalTimeStamp()} | Block : ${
        latestBlockNumber ? latestBlockNumber : "Pending"
      } | Selling`
    )
  );
};

export {
  //   liqAddReqValidator,
  honeyPotReqValidator,
  buyEnabledCheckReqValidator,
  buyReqValidator,
  approveReqValidator,
  bookProfitReqValidator,
  sellReqValidator,
};

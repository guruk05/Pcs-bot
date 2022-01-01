import ethers from "ethers";

const log = new ethers.utils.Logger(process.env.npm_package_version);

// var log = bunyan.createLogger({
//   name: config.NAME,
//   streams: [
//     {
//       type: "rotating-file",
//       level: "debug",
//       path:
//         __dirname +
//         `/logs/-${config.NAME}-${new Date().toISOString().split("T")[0]}.log`,
//       period: "1d", // daily rotation
//       count: 1, // keep 3 back copies
//     },
//   ],
//   src: true,
// });

export default log;

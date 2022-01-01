import dotenv from "dotenv";

import path from "path";

const __dirname = path.resolve();

const defaultEnv = "test";
const defaultChain = "bsc";
const env = process.env.NODE_ENV || defaultEnv;
const chain = process.env.CHAIN || defaultChain;
const envPath = path.join(__dirname, ".", `.env.${chain}.${env}`);
const result = dotenv.config({ path: envPath });

if (result.error) {
  throw result.error;
}
const { parsed: envs } = result;
// console.log("EnvPath --- " + envPath);

export default envs;

import { curly } from "node-libcurl";
import dotenv from "dotenv";

dotenv.config();
const { CERAMIC_API_1 } = process.env;

// function that checks which Ceramic node is up
export const checkCeramicFast = async () => {
  try {
    const data = await curly.get(CERAMIC_API_1 + "/api/v0/node/healthcheck");
    if (data.statusCode !== 200 || data.data !== "Alive!") {
      console.log("Ceramic node 1 is down, using node 2");
      return 2;
    }
    console.log("Ceramic node 1 is up, using node 1");
    return 1;
  } catch (error) {
    console.error(error);
    return;
  }
};

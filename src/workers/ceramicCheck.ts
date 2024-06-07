import { curly } from "node-libcurl";
import dotenv from "dotenv";

dotenv.config();
const { CERAMIC_API } = process.env;

// function that checks if the Ceramic node is up - if not, wait 10 seconds and try again
export const checkCeramic = async (iterations = 0) => {
    try {
      if (iterations > 3) {
        console.log("Ceramic is down after 3 attempts");
        return;
      }
      const data = await curly.get(CERAMIC_API + "/api/v0/node/healthcheck");
      if (data.statusCode !== 200 || data.data !== "Alive!") {
        console.log("Ceramic is down");
        await new Promise((resolve) => setTimeout(resolve, 10000));
        return void checkCeramic(iterations + 1);
      }
    } catch (error) {
      console.error(error);
      return;
    }
  };
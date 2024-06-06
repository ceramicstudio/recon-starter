import { Worker, Queue } from "bullmq";
import { type SinglePointsRequest } from "@/types";
import { createAllocation } from "@/utils/ceramic/createPoints";
import { curly } from "node-libcurl";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
const { REDIS_URL, CERAMIC_API } = process.env;

export const allocationQueue = new Queue("allocationQueue", {
  connection: new IORedis(REDIS_URL!, {
    maxRetriesPerRequest: null,
  }),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

export const allocationWorker = new Worker(
  "allocationQueue",
  async (job) => {
    try {
      await checkCeramic();
      const data = job?.data as SinglePointsRequest;
      const response = await createAllocation(data);
      if (response === undefined) {
        throw new Error("Unable to update context aggregation");
      } else {
        return response;
      }
    } catch (error) {
      console.error(
        `Job ${job.id} failed with error ${(error as Error).message}`,
      );
      throw error;
    }
  },
  {
    removeOnFail: { count: 50000 },
    connection: new IORedis(REDIS_URL!, {
      maxRetriesPerRequest: null,
    }),
    limiter: {
      max: 1,
      duration: 1000,
    },
  },
);

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

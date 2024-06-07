import { Worker, Queue } from "bullmq";
import { type SinglePointsRequest } from "@/types";
import { createContextAggregation } from "@/utils/ceramic/createPoints";
import { checkCeramic } from "@/workers/ceramicCheck"
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
const { REDIS_URL } = process.env;

export const contextQueue = new Queue("contextQueue", {
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

export const contextWorker = new Worker(
  "contextQueue", 
  async (job) => {
    try {
      await checkCeramic();
      const data = job?.data as SinglePointsRequest;
      const response = await createContextAggregation(
        data.recipient,
        data.context,
        data.amount,
      );
      if (response === undefined) {
        throw new Error("Unable to update context aggregation");
      } else {
        console.log(`Context aggregation created or updated for ${data.recipient} in context ${data.context}`);
        return response;
      }
    } catch (error) {
      console.error(`Job ${job.id} failed with error ${(error as Error).message}`);
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


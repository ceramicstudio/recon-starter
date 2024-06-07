import { Worker, Queue } from "bullmq";
import { type TotalAggregationWorkerInput } from "@/types";
import {
  updateTotalAggregation,
  createPatchedTotalAgg,
} from "@/utils/ceramic/createPoints";
import { checkCeramic } from "@/workers/ceramicCheck"
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
const { REDIS_URL } = process.env;

export const totalsQueue = new Queue("totalsQueue", {
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

export const totalsWorker = new Worker(
  "totalsQueue",
  async (job) => {
    try {
      await checkCeramic();
      const data = job?.data as TotalAggregationWorkerInput;
      const response =
        data.verified === true &&
        data.date &&
        data.points !== undefined &&
        data.points > 0
          ? await createPatchedTotalAgg(
              data.recipient,
              data.date,
              data.points,
              data.verified,
            )
          : await updateTotalAggregation(data.recipient, data.amount);
      if (response === undefined) {
        throw new Error("Unable to update total aggregation");
      } else {
        console.log(
          `Totals aggregation created or updated for ${data.recipient}`,
        );
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


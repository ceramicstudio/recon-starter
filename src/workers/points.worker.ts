import { Worker, Queue } from "bullmq";
import { type PointsWorkerInput } from "@/types";
import { createAllocation } from "@/utils/ceramic/createPoints";
import { createContextAggregation } from "@/utils/ceramic/createPoints";
import {
  updateTotalAggregation,
  createPatchedTotalAgg,
} from "@/utils/ceramic/createPoints";
import { checkCeramic } from "@/workers/ceramicCheck";
import IORedis from "ioredis";
import dotenv from "dotenv";

dotenv.config();
const { REDIS_URL } = process.env;

export const pointsQueue = new Queue("pointsQueue", {
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

export const pointsWorker = new Worker(
  "pointsQueue",
  async (job) => {
    try {
      await checkCeramic();
      const data = job?.data as PointsWorkerInput;
      switch (data.docType) {
        case "allocation":
          const allocationResponse = await createAllocation(data);
          if (allocationResponse === undefined) {
            throw new Error("Unable to update context aggregation");
          } else {
            console.log(
              `Allocation created for ${data.recipient} in context ${data.context}`,
            );
            return allocationResponse;
          }

        case "context":
          const contextAggResponse = await createContextAggregation(
            data.recipient,
            data.context,
            data.amount,
          );
          if (contextAggResponse === undefined) {
            throw new Error("Unable to update context aggregation");
          } else {
            console.log(
              `Context aggregation created or updated for ${data.recipient} in context ${data.context}`,
            );
            return contextAggResponse;
          }

        case "total":
          const totalAggResponse = await updateTotalAggregation(
            data.recipient,
            data.amount,
          );
          if (totalAggResponse === undefined) {
            throw new Error("Unable to update total aggregation");
          } else {
            console.log(
              `Totals aggregation created or updated for ${data.recipient}`,
            );
            return totalAggResponse;
          }
          
        case "patchedTotal":
          const patchedTotalAggResponse = await createPatchedTotalAgg(
            data.recipient,
            data.date!,
            data.points!,
            data.verified!,
          );
          if (patchedTotalAggResponse === undefined) {
            throw new Error("Unable to patch total aggregation");
          } else {
            console.log(
              `Totals aggregation created or updated for ${data.recipient}`,
            );
            return patchedTotalAggResponse;
          }
        default:
          throw new Error("Invalid docType");
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

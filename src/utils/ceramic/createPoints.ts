import {
  contextWriterOne,
  contextWriterTwo,
  writerOne,
  writerTwo,
} from "./context";
import { checkCeramicFast } from "@/workers/ceramicCheck";
import type { ModelInstanceDocument } from "@composedb/types";
import {
  type PointsContent,
  type AggregationContent,
  type AllocationContent,
  type SinglePointsRequest,
  type RecipientScore,
} from "@/types";
import { getAggregation } from "@/utils/ceramic/readAggregations";
import { pointsQueue } from "@/workers/points.worker";

export const createAllocation = async ({
  recipient,
  amount,
  context,
  multiplier,
  subContext,
  trigger,
}: SinglePointsRequest): Promise<
  ModelInstanceDocument<AllocationContent> | undefined
> => {
  try {
    const contextWriter =
      (await checkCeramicFast()) === 1 ? contextWriterOne : contextWriterTwo;
    const allocation = await contextWriter.allocatePointsTo(recipient, amount, {
      context,
      date: new Date().toISOString(),
      multiplier: multiplier ?? 0,
      subContext,
      trigger,
    } as Partial<AllocationContent>);
    return allocation as ModelInstanceDocument<AllocationContent>;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const createContextAggregation = async (
  recipient: string,
  context: string,
  amount: number,
): Promise<ModelInstanceDocument<AggregationContent> | undefined> => {
  try {
    // get context aggregation doc if exists
    const aggregationDoc = await getAggregation(recipient, context);

    const contextWriter =
      (await checkCeramicFast()) === 1 ? contextWriterOne : contextWriterTwo;
    // update context-specific aggregation
    const updatedContextAgg: ModelInstanceDocument<AggregationContent> =
      await contextWriter.setPointsAggregationFor(
        [recipient, context],
        amount + (aggregationDoc?.content?.points ?? 0),
        {
          recipient,
          points: (aggregationDoc?.content?.points ?? 0) + amount,
          date: new Date().toISOString(),
          context,
        } as Partial<PointsContent>,
      );

    return updatedContextAgg;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const updateTotalAggregation = async (
  recipient: string,
  amount: number,
): Promise<ModelInstanceDocument<AggregationContent> | undefined> => {
  try {
    const writer = (await checkCeramicFast()) === 1 ? writerOne : writerTwo;
    // update total aggregation
    const updatedTotalAgg: ModelInstanceDocument<AggregationContent> =
      await writer.updatePointsAggregationFor([recipient], (content) => {
        return {
          points: content ? content.points + amount : amount,
          date: new Date().toISOString(),
          recipient,
        };
      });
    return updatedTotalAgg;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const createPoints = async (score: RecipientScore) => {
  try {
    score.amount = score.score;

    await pointsQueue.add("pointsQueue", {
      recipient: score.recipient,
      amount: score.amount,
      context: score.context,
      multiplier: score.multiplier,
      subContext: score.subContext,
      trigger: score.trigger,
      docType: "allocation",
    });

    // then update or create context aggregation
    await pointsQueue.add("pointsQueue", {
      recipient: score.recipient,
      context: score.context,
      amount: score.amount,
      docType: "context",
    });

    // then update Total Aggregation
    await pointsQueue.add("pointsQueue", {
      recipient: score.recipient,
      amount: score.amount,
      docType: "total",
    });

    return {
      message: "Successfully added requests to queues",
    };
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const createPatchedTotalAgg = async (
  recipient: string,
  date: string,
  points: number,
  verified: boolean | null,
): Promise<AggregationContent | undefined> => {
  try {
    // check which writer to use
    const writer = (await checkCeramicFast()) === 1 ? writerOne : writerTwo;

    // update total aggregation
    const updatedTotalAgg: ModelInstanceDocument<AggregationContent> =
      await writer.updatePointsAggregationFor([recipient], (content) => {
        return verified !== null
          ? {
              points: content ? content.points + points : points,
              date,
              recipient,
              verified,
            }
          : {
              points: content ? content.points + points : points,
              date,
              recipient,
            };
      });
    return {
      points: updatedTotalAgg.content ? updatedTotalAgg.content.points : 0,
      date: updatedTotalAgg.content ? updatedTotalAgg.content.date : "",
      recipient: updatedTotalAgg.content
        ? updatedTotalAgg.content.recipient
        : "",
    };
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

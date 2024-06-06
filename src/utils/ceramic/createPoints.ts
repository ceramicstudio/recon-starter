import { contextWriter, writer } from "./context";
import type { ModelInstanceDocument } from "@composedb/types";
import {
  type PointsContent,
  type AggregationContent,
  type AllocationContent,
  type SinglePointsRequest,
  type RecipientScore,
} from "@/types";
import { getAggregation } from "@/utils/ceramic/readAggregations";
import { totalsQueue } from "@/workers/aggregations.worker";

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
    // first create allocation
    const allocation = await createAllocation({
      recipient: score.recipient,
      amount: score.amount,
      context: score.context,
      multiplier: score.multiplier,
      subContext: score.subContext,
      trigger: score.trigger,
    });

    // then update Total Aggregation
    const updatedTotalAgg = await updateTotalAggregation(
      score.recipient,
      score.amount,
    );
    // const updatedTotalAgg = await totalsQueue.add("totalsQueue", {
    //   recipient: score.recipient,
    //   amount: score.amount,
    // });

    // then create aggregations
    const updatedContextAgg = await createContextAggregation(
      score.recipient,
      score.context,
      score.amount,
    );
    // do checking here
    if (!updatedContextAgg || !updatedTotalAgg) {
      return undefined;
    }
    return {
      contextTotal: updatedContextAgg.content
        ? updatedContextAgg.content.points
        : 0,
      total: updatedTotalAgg.content ? updatedTotalAgg.content.points : 0,
      allocationDoc: allocation?.content ?? undefined,
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

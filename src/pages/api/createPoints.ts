import { type NextApiRequest, type NextApiResponse } from "next";
import type { ModelInstanceDocument } from "@composedb/types";
import {
  type AggregationContent,
  type NewPoints,
  type SinglePointsRequest,
  type Error
} from "@/types";
import { totalsQueue } from "@/workers/totalAggregations.worker";
import {contextQueue} from "@/workers/contextAggregations.worker";
import {allocationQueue} from "@/workers/allocations.worker";

interface Request extends NextApiRequest {
  body: SinglePointsRequest;
}

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(data: {message: string} | Error): void;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { recipient, amount, context, multiplier, subContext, trigger } = req.body;

    // first create allocation
    await allocationQueue.add("allocationsQueue", {
      recipient,
      amount,
      context,
      multiplier,
      subContext,
      trigger,
    });

    // then create aggregations
    await totalsQueue.add("totalsQueue", {
      recipient,
      amount,
    });

    await contextQueue.add("contextQueue", {
      recipient,
      context, 
      amount,
    });
    

    // res.status(200).send({
    //   contextTotal: updatedContextAgg.content
    //     ? updatedContextAgg.content.points
    //     : 0,
    //   total: updatedTotalAgg.content ? updatedTotalAgg.content.points : 0,
    //   allocationDoc: allocation?.content ?? undefined,
    // });
    return res.status(200).send({ message: "Points successfully added to queues" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

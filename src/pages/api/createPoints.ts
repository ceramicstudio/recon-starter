import { type NextApiRequest, type NextApiResponse } from "next";
import type { ModelInstanceDocument } from "@composedb/types";
import {
  type AggregationContent,
  type NewPoints,
  type SinglePointsRequest,
  type Error
} from "@/types";
import { createAggregations, createAllocation } from "@/utils/ceramic/createPoints";

interface Request extends NextApiRequest {
  body: SinglePointsRequest;
}

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(data: NewPoints | Error): void;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { recipient, amount, context, multiplier } = req.body;

    // first create allocation
    const allocation = await createAllocation({
      recipient,
      amount,
      context,
      multiplier,
    });

    // then create aggregations
    const { updatedContextAgg, updatedTotalAgg } = (await createAggregations(
      recipient,
      context,
      amount,
    )) as {
      updatedContextAgg: ModelInstanceDocument<AggregationContent>;
      updatedTotalAgg: ModelInstanceDocument<AggregationContent>;
    };

    res.status(200).send({
      contextTotal: updatedContextAgg.content
        ? updatedContextAgg.content.points
        : 0,
      total: updatedTotalAgg.content ? updatedTotalAgg.content.points : 0,
      allocationDoc: allocation?.content ?? undefined,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

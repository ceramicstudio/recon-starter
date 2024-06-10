import { type NextApiRequest, type NextApiResponse } from "next";
import type { ModelInstanceDocument } from "@composedb/types";
import {
  type AggregationContent,
  type NewPoints,
  type SinglePointsRequest,
  type Error,
} from "@/types";
import { pointsQueue } from "@/workers/points.worker";

interface Request extends NextApiRequest {
  body: SinglePointsRequest;
}

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(data: { message: string } | Error): void;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { recipient, amount, context, multiplier, subContext, trigger } =
      req.body;

    // first create allocation
    await pointsQueue.add("pointsQueue", {
      recipient,
      amount,
      context,
      multiplier,
      subContext,
      trigger,
      docType: "allocation",
    });

    // then create context aggregation
    await pointsQueue.add("pointsQueue", {
      recipient,
      context,
      amount,
      docType: "context",
    });

    // then create total aggregation
    await pointsQueue.add("pointsQueue", {
      recipient,
      amount,
      docType: "total",
    });

    return res
      .status(200)
      .send({ message: "Points successfully added to queues" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

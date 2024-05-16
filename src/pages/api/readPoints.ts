import { type NextApiRequest, type NextApiResponse } from "next";
import { contextReader, reader } from "@/utils/context";
import { getAllocations } from "@/utils/readAllocations";
import { type AllocationNode, type Error } from "@/utils/types";

interface Request extends NextApiRequest {
  body: {
    recipient: string;
    context: string;
  };
}

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(
    data:
      | {
          contextTotal: number;
          total: number;
          allocations: AllocationNode[] | undefined;
        }
      | Error,
  ): void;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { recipient, context } = req.body;
    const allocations = await getAllocations(recipient, context);
    const [contextTotal, total] = await Promise.all([
      contextReader.getAggregationPointsFor([recipient, context]),
      reader.getAggregationPointsFor([recipient]),
    ]);
    res.status(200).send({
      contextTotal,
      total,
      allocations: allocations ?? undefined,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

import { type NextApiRequest, type NextApiResponse } from "next";
import {
  contextReaderOne,
  contextReaderTwo,
  readerOne,
  readerTwo,
} from "@/utils/ceramic/context";
import { checkCeramicFast } from "@/workers/ceramicCheck";
import { getAllocations } from "@/utils/ceramic/readAllocations";
import { type AllocationNode, type Error } from "@/types";

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

    // check which ceramic node to use
    const nodecheck = await checkCeramicFast();
    const contextReader = nodecheck === 1 ? contextReaderOne : contextReaderTwo;
    const reader = nodecheck === 1 ? readerOne : readerTwo;

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

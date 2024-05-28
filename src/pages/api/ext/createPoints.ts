import { type NextApiRequest, type NextApiResponse } from "next";
import { getPgAllocation } from "@/utils/pg/pgAllocationQuery";
import { writeScoresToPg } from "@/utils/pg/processPgPoints";
import { processSingleContextPoints } from "@/utils/ceramic/processSingleContextPoints";
import {
  type SinglePointsRequest,
  type NewPoints,
  type Error,
  type AllocationContent,
  type RecipientScore,
} from "@/types";

const approvedContexts = process.env.APPROVED_CONTEXTS?.split(",") ?? [];

interface Request extends NextApiRequest {
  body: SinglePointsRequest & {
    // time represented in number of days
    timing?: number;
    oneTime?: boolean;
  };
}

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(data: NewPoints | Error | { message: string }): void;
}

export default async function handler(req: Request, res: Response) {
  try {
    const {
      recipient,
      amount,
      context,
      multiplier,
      subContext,
      timing,
      oneTime,
    } = req.body;

    // check if the context is approved
    // if (!approvedContexts.includes(context)) {
    //   return res.status(400).send({ error: "Invalid context" });
    // }

    // first grab allocations given the parameters from pg
    const allocations = await getPgAllocation(
      recipient,
      context,
      subContext,
    ).then((data) => {
      return data?.allocations as Array<AllocationContent>;
    });

    // if allocations is undefined, return an error
    if (allocations === undefined) {
      return res.status(500).send({ error: "Internal Server Error" });
    }

    const recipientScores = [] as Array<RecipientScore>;

    // if allocations exist, sort them by date

    allocations.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // if allocations is not empty and oneTime is true, return a message
    if (allocations?.length && oneTime) {
      return res.status(200).send({ message: "Allocation already exists" });
    }

    // if allocations is not empty and timing is provided, check if the last allocation is outside the timing window
    if (allocations?.length && allocations[0] && timing) {
      const lastAllocation = new Date(allocations[0].date);
      const timeDifference = Math.abs(
        new Date().getTime() - lastAllocation.getTime(),
      );
      const timeToWait = timing * 24 * 60 * 60 * 1000;
      if (timeDifference < timeToWait) {
        return res.status(200).send({ message: "Not enough time has passed" });
      }
    }

    // otherwise, create a new allocation
    recipientScores.push({
      recipient:
        recipient.length !== 42
          ? recipient.slice(recipient.length - 42)
          : recipient,
      score: amount,
      context,
      subContext,
      multiplier,
    });

    return res.status(200).json(recipientScores);

    // process and write the patches to Postgres
    const pgResults = await writeScoresToPg(recipientScores);
    console.log("Processed PG external patches: ", pgResults);

    // process and write the patches to Ceramic
    const results = await processSingleContextPoints(recipientScores);
    return res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

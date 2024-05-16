import { type NextApiRequest, type NextApiResponse } from "next";
import { calculate } from "@/utils/calculateScores";
import { type RecipientScore, type Error, type DeformEntry } from "@/utils/types";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(
    data:
      | {
          recipientScores: Array<RecipientScore>;
        }
      | Error,
  ): void;
}

// We assume the array's first array are the questions and the rest are answers
interface Request extends NextApiRequest {
  body: {
    //the inner array has a length of 28
    rows: DeformEntry[];
    startRow: number;
  };
}

export default async function handler(req: Request, res: Response) {
  try {
    const recipientScores = (await calculate(req.body)) as
      | {
          recipient: string;
          score: number;
          context: string;
        }[]
      | { error: string };

    if ("error" in recipientScores) {
      res.status(500).send({ error: recipientScores.error });
    } else {
      res.status(200).send({ recipientScores: recipientScores });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

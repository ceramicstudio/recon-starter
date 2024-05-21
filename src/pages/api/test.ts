import { patchAggTotals } from "@/utils/patching/patchAggTotals";
import { type NextApiRequest, type NextApiResponse } from "next";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(
    data:
      | { score: string; address: string; last_score_timestamp: string }
      | { error: string },
  ): void;
}

export default async function handler(req: NextApiRequest, res: Response) {
  try {
    const data = await patchAggTotals();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

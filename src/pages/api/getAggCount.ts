import { type NextApiRequest, type NextApiResponse } from "next";
import { getAggregationCount } from "@/utils/ceramic/readAggregationCount";
import { type Error } from "@/types";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(
    data:
      | {
          aggregations: number | undefined;
        }
      | Error,
  ): void;
}

export default async function handler(_req: NextApiRequest, res: Response) {
  try {
    const aggregations = await getAggregationCount();
    res.status(200).send({ aggregations: aggregations ?? undefined });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

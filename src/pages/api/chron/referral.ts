import { type Error, type Message, type NewPoints } from "@/utils/types";
import { type NextApiRequest, type NextApiResponse } from "next";
import { calculateReferrals } from "@/utils/referrals";
import { getDeform } from "@/utils/getDeformData";
import { getAggregationCount } from "@/utils/readAggregationCount";
import { processReferralPoints } from "@/utils/processReferralPoints";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(data: Array<NewPoints> | Message | Error): void;
}

export default async function handler(req: NextApiRequest, res: Response) {
  try {
    // fetch number of current aggregation docs since we only want to calculate referrals for existing entries
    const count = await getAggregationCount();

    // failure mode for fetching aggregation data
    if (count === undefined) {
      return res
        .status(500)
        .send({ error: "Unable to fetch aggregation data" });
    }

    const rows = await getDeform().then((data) => {
      return data?.data;
    });

    // failure mode for fetching DeForm data
    if (!rows) {
      return res.status(500).send({ error: "Unable to fetch DeForm data" });
    }

    // calculate referral scores
    const finalScores = await calculateReferrals({
      rows,
      startRow: count,
      chron: true,
    });

    // failure mode for calculating scores
    if ("error" in finalScores) {
      return res.status(500).send({ error: finalScores.error });
    }

    // process and write the scores to Ceramic
    const results = await processReferralPoints(finalScores);
    if (results) {
      res.status(200).send(results);
    } else {
      res.status(500).send({ error: "Internal Server Error" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

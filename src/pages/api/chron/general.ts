import { type Error, type Message, type NewPoints } from "@/utils/types";
import { type NextApiRequest, type NextApiResponse } from "next";
import { processSingleContextPoints } from "@/utils/processSingleContextPoints";
import { calculate } from "@/utils/calculateScores";
import { getAggregationCount } from "@/utils/readAggregationCount";
import { getDeform } from "@/utils/getDeformData";
import { calculateReferrals } from "@/utils/referrals";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(data: Array<NewPoints> | Message | Error): void;
}

export default async function handler(req: NextApiRequest, res: Response) {
  try {

    // fetch the DeForm data
    const rows = await getDeform().then((data) => {
      return data?.data;
    });

    // failure mode for fetching DeForm data
    if (!rows) {
      return res
        .status(500)
        .send({ error: "Unable to fetch DeForm data" });
    }
    //determine the total number of entries
    const totalEntries = rows.length;

    //fetch number of current agg documents as a proxy for the number entries recorded
    const aggregations = await getAggregationCount();

    // failure mode for fetching aggregation data
    if (aggregations === undefined) {
      return res
        .status(500)
        .send({ error: "Unable to fetch aggregation data" });
    }

    // set the difference between the total entries and the number of entries recorded
    const difference = totalEntries - aggregations;
    

    // if there are new entries, calculate the final scores
    if (rows && difference > 0) {
      const finalScores = await calculate({
        rows,
        startRow: aggregations,
      });
      // failure mode for calculating scores
      if ("error" in finalScores) {
        return res.status(500).send({ error: finalScores.error });
      }

      const referralScores = await calculateReferrals({ rows, startRow: aggregations });

      // failure mode for calculating referral scores
      if ("error" in referralScores) {
        return res.status(500).send({ error: referralScores.error });
      }
      
      // process and write the scores to Ceramic
      const results = await processSingleContextPoints([...finalScores, ...referralScores]);

      if (results) {
        res.status(200).send(results);
      } else {
        res.status(500).send({ error: "Internal Server Error" });
      }
    } else {
      res.status(200).send({ message: "No new entries to process" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

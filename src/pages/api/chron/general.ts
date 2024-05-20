import { type Error, type Message, type NewPoints } from "@/types";
import { type NextApiRequest, type NextApiResponse } from "next";
import { processSingleContextPoints } from "@/utils/ceramic/processSingleContextPoints";
import { calculate } from "@/utils/calculate/calculateScores";
import { getDeform } from "@/utils/getDeformData";
import { calculateReferrals } from "@/utils/calculate/calculateReferrals";
import { processReferralPoints } from "@/utils/ceramic/processReferralPoints";
import {
  processReferralPgPoints,
  writeScoresToPg,
} from "@/utils/pg/processPgPoints";
import { getPgTotalCount } from "@/utils/pg/pgAggregationCount";
import {saveCustomers} from "@/utils/pg/saveCustomer";
// import { getAggregationCount } from "@/utils/readAggregationCount";

/*
NOTE: current implementation uses Postgres as the source of truth, and prioritizes writing to Postgres first.
*/

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
      return res.status(500).send({ error: "Unable to fetch DeForm data" });
    }
    //determine the total number of entries
    const totalEntries = rows.length;

    //fetch number of current agg documents as a proxy for the number entries recorded from Ceramic
    // const aggregations = await getAggregationCount();

    // fetch the total number of entries from the Postgres database
    const aggregations = await getPgTotalCount().then((data) => {
      return data?.aggregationCount;
    });

    // failure mode for fetching aggregation data
    if (aggregations === undefined) {
      return res
        .status(500)
        .send({ error: "Unable to fetch aggregation data" });
    }

    // first, save customers to Postgres
    const customers = await saveCustomers({rows, startRow: aggregations});

    // failure mode for saving customers to Postgres
    if ("error" in customers) {
      return res.status(500).send({ error: customers.error });
    }

    // handle patching of referral scores for existing entries - start by calculating the referral scores
    const finalReferralScores = await calculateReferrals({
      rows,
      startRow: aggregations,
      chron: true,
    });

    // failure mode for calculating referral scores for existing entries
    if ("error" in finalReferralScores) {
      return res.status(500).send({ error: finalReferralScores.error });
    }

    // process and write the patches to Postgres
    const patchedReferralPgResults =
      finalReferralScores.length > 0
        ? await processReferralPgPoints(finalReferralScores)
        : [];

    console.log("Processed PG referral patches: ", patchedReferralPgResults);

    // process and write the patches to Ceramic
    const patchedReferralResults =
      finalReferralScores.length > 0
        ? await processReferralPoints(finalReferralScores)
        : [];

    // next, handle new entries

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

      const referralScores = await calculateReferrals({
        rows,
        startRow: aggregations,
      });

      // failure mode for calculating referral scores
      if ("error" in referralScores) {
        return res.status(500).send({ error: referralScores.error });
      }

      // Take care of PG first
      const pgResults = await writeScoresToPg([
        ...finalScores,
        ...referralScores,
      ]);

      console.log("Processed PG results: ", pgResults);

      // process and write the scores to Ceramic
      const results = await processSingleContextPoints([
        ...finalScores,
        ...referralScores,
      ]);

      if (results && patchedReferralResults) {
        res.status(200).send([...results, ...patchedReferralResults]);
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

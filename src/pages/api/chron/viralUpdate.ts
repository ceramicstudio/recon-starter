import { getTweet } from "@/utils/twitter/index";
import { getDeform } from "@/utils/deform/getDeformData";
import { type NextApiResponse, type NextApiRequest } from "next";
import { getPgAllocationCount } from "@/utils/pg/pgAllocationCount";
import { type RecipientScore, type NewPoints } from "@/types";
import { writeScoresToPg } from "@/utils/pg/processPgPoints";
import { processMultiPoints } from "@/utils/ceramic/processMultiPoints";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(data: Array<NewPoints> | undefined | { error: string }): void;
}

const DEFORM_VIRAL_FORM_ID = process.env.DEFORM_VIRAL_FORM_ID ?? "";
const X_PLATFORM_HANDLE = process.env.X_PLATFORM_HANDLE ?? "";

export default async function handler(_req: NextApiRequest, res: Response) {
  try {
    // fetch the DeForm data
    const deformData = await getDeform(DEFORM_VIRAL_FORM_ID).then((data) => {
      return data?.data;
    });

    const allocationData = await getPgAllocationCount("viral");
    // failure mode for fetching DeForm data or allocation data
    if (!deformData || !allocationData) {
      return res.status(500).send({ error: "Internal Server Error" });
    }

    // first, see if there is a difference between the number of rows in the PG database and the number of rows in the DeForm database
    const difference = deformData.length - allocationData.allocationCount;
    const recipientScores = [] as Array<RecipientScore>;
    // if there is a difference, then we need to update the Notion database
    if (difference > 0) {
      for (let i = 0; i < difference; i++) {
        const newEntry = deformData[deformData.length - 1 - i];
        const tweet = newEntry?.answers.find(
          (answer) =>
            answer.name === "Link to your original X post with 40+ likes.",
        )?.value;
        const user = newEntry?.answers.find(
          (answer) =>
            answer.name === "Connect your X account. - Twitter Username",
        )?.value;
        const wallet = newEntry?.answers.find(
          (answer) =>
            answer.name === "Connect your crypto wallet - Wallet Address",
        )?.value;
        if (
          !tweet ||
          typeof tweet !== "string" ||
          !user ||
          typeof user !== "string" ||
          !wallet ||
          typeof wallet !== "string"
        ) {
          return res
            .status(500)
            .send({ error: "Unable to retrieve Tweet user input" });
        }
        const isValid = await getTweet(tweet);
        if (!isValid) {
          return res
            .status(500)
            .send({ error: "Unable to retrieve Tweet data" });
        }
        const { tweetData, likes, account } = isValid;

        // perform checks
        const isUser = account === user;
        const likesAboveTwo = likes.meta.result_count > 2;
        const mentionsPlatform =
          tweetData.data.text.includes(X_PLATFORM_HANDLE);

        // if all checks pass, then we can add the entry to the returnEntries array
        if (isUser && likesAboveTwo && mentionsPlatform) {
          recipientScores.push({
            recipient: `did:pkh:eip155:1:${wallet.toLowerCase()}`,
            score: 750,
            context: "viral",
          });
        }
        // if the checks fail, still add the entry to the returnEntries array, but with a score of 0 to ensure the entry is recorded
        else {
          recipientScores.push({
            recipient: `did:pkh:eip155:1:${wallet.toLowerCase()}`,
            score: 0,
            context: "viral",
          });
        }
      }
    }
    // process and write the patches to Postgres
    const pgResults = await writeScoresToPg(recipientScores);
    console.log("Processed PG viral patches: ", pgResults);

    // process and write the patches to Ceramic
    const results = await processMultiPoints(recipientScores);
    return res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

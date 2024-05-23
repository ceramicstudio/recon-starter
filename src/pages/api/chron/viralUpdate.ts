import { getTweet } from "@/utils/twitter/index";
import { getDeform } from "@/utils/deform/getDeformData";
import { type NextApiResponse, type NextApiRequest } from "next";
import { getPgContextCount } from "@/utils/pg/pgContextCount";
import { type RecipientScore, type NewPoints } from "@/types";
import { writeScoresToPg } from "@/utils/pg/processPgPoints";
import { processSingleContextPoints } from "@/utils/ceramic/processSingleContextPoints";
import { curly } from "node-libcurl";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(data: Array<NewPoints> | undefined | { error: string }): void;
}

const DEFORM_VIRAL_FORM_ID = process.env.DEFORM_VIRAL_FORM_ID ?? "";
const X_PLATFORM_HANDLE = process.env.X_PLATFORM_HANDLE ?? "";
const CERAMIC_API = process.env.CERAMIC_API ?? "";

export default async function handler(req: NextApiRequest, res: Response) {
  try {
    // check if ceramic is up
    const data = await curly.get(CERAMIC_API + "/api/v0/node/healthcheck");
    if (data.statusCode !== 200 || data.data !== "Alive!") {
      return res.status(500).send({ error: "Ceramic is down" });
    }

    const deformData = await getDeform(DEFORM_VIRAL_FORM_ID).then((data) => {
      return data?.data;
    });

    const aggregationData = await getPgContextCount("viral");
    // failure mode for fetching DeForm data or aggregation data
    if (!deformData || !aggregationData) {
      return res.status(500).send({ error: "Internal Server Error" });
    }

    // first, see if there is a difference between the number of rows in the PG database and the number of rows in the DeForm database
    const difference = deformData.length - aggregationData.aggregationCount;
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
        // check that aggregation data does not already contain the wallet address
        const walletExists = aggregationData.aggregations.some(
          (row) => row.recipient === `did:pkh:eip155:1:${wallet.toLowerCase()}`,
        );
        // if all checks pass, then we can add the entry to the returnEntries array
        if (isUser && likesAboveTwo && mentionsPlatform && !walletExists) {
          recipientScores.push({
            recipient: `did:pkh:eip155:1:${wallet.toLowerCase()}`,
            score: 750,
            context: "viral",
          });
        }
      }
    }
    // process and write the patches to Postgres
    const pgResults = await writeScoresToPg(recipientScores);
    console.log("Processed PG viral patches: ", pgResults);

    // process and write the patches to Ceramic
    const results = await processSingleContextPoints(recipientScores);
    return res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

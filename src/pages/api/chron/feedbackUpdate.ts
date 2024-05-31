import { getNotion } from "@/utils/notion/index";
import { patchNotion } from "@/utils/notion/patch";
import { getPgAllocationCount } from "@/utils/pg/pgAllocationCount";
import { getDeform } from "@/utils/deform/getDeformData";
import { type NextApiRequest, type NextApiResponse } from "next";
import {
  type NotionFeedbackType,
  type NotionFeedbackEntry,
  type RecipientScore,
} from "@/types";
import { writeScoresToPg } from "@/utils/pg/processPgPoints";
import { processSingleContextPoints } from "@/utils/ceramic/processSingleContextPoints";
import { curly } from "node-libcurl";

const NOTION_FEEDBACK_DATABASE_ID =
  process.env.NOTION_FEEDBACK_DATABASE_ID ?? "";
const DEFORM_FEEDBACK_FORM_ID = process.env.DEFORM_FEEDBACK_FORM_ID ?? "";
const CERAMIC_API = process.env.CERAMIC_API ?? "";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // check if ceramic is up
    const data = await curly.get(CERAMIC_API + "/api/v0/node/healthcheck");
    if (data.statusCode !== 200 || data.data !== "Alive!") {
      return res.status(500).send({ error: "Ceramic is down" });
    }

    // fetch the Notion and DeForm data
    const notionData = (await getNotion(
      NOTION_FEEDBACK_DATABASE_ID,
      "Feedback",
    )) as NotionFeedbackType[];

    const deformData = await getDeform(DEFORM_FEEDBACK_FORM_ID).then((data) => {
      return data?.data;
    });

    // fetch the allocation data
    const allocationData = await getPgAllocationCount("feedback");

    // failure mode for fetching Notion or DeForm data
    if (!notionData || !deformData || !allocationData) {
      return res.status(500).send({ error: "Internal Server Error" });
    }

    // first, see if there is a difference between the number of rows in the Notion database and the number of rows in the DeForm database
    const difference = deformData.length - notionData.length;
    const returnEntries: NotionFeedbackType[] = [];
    // if there is a difference, then we need to update the Notion database
    if (difference > 0) {
      for (let i = 0; i < difference; i++) {
        const newEntry = deformData[deformData.length - 1 - i];
        const participation = newEntry?.answers.find(
          (answer) =>
            answer.name === "How do you participate in the Atlas community?",
        )?.value;
        const categories = newEntry?.answers.find(
          (answer) => answer.name === "What are you providing feedback on?",
        )?.value;
        const experience = newEntry?.answers.find(
          (answer) => answer.name === "Rate your experience",
        )?.value;
        const wallet = newEntry?.answers.find(
          (answer) =>
            answer.name === "Connect your crypto wallet - Wallet Address",
        )?.value;
        const feedback = newEntry?.answers.find(
          (answer) => answer.name === "Write your feedback",
        )?.value;
        const email = newEntry?.answers.find(
          (answer) => answer.name === "What's your email address?",
        )?.value;

        // if any of the required fields are missing, return an error (not sure if we want this in production)
        if (
          !wallet ||
          typeof wallet !== "string" ||
          !participation ||
          !categories ||
          !experience ||
          !feedback ||
          !email
        ) {
          return res
            .status(500)
            .send({ error: "Deform did not provide user inputs" });
        }

        const entry: NotionFeedbackEntry = {
          Participation: {
            title: [
              {
                text: {
                  content:
                    typeof participation === "string"
                      ? participation
                      : participation.join(", "),
                },
              },
            ],
          },
          Wallet: {
            rich_text: [
              {
                text: {
                  content: wallet,
                },
              },
            ],
          },
          Categories: {
            rich_text: [
              {
                text: {
                  content:
                    typeof categories === "string"
                      ? categories
                      : categories.join(", "),
                },
              },
            ],
          },
          Email: {
            rich_text: [
              {
                text: {
                  content: typeof email === "string" ? email : email.join(", "),
                },
              },
            ],
          },
          Experience: {
            number: typeof experience === "string" ? Number(experience) : 0,
          },
          Feedback: {
            rich_text: [
              {
                text: {
                  content:
                    typeof feedback === "string"
                      ? feedback
                      : feedback.join(", "),
                },
              },
            ],
          },
        };

        // patch the Notion database with the new entry
        const patchData = await patchNotion(
          NOTION_FEEDBACK_DATABASE_ID,
          "Feedback",
          entry,
        );
        if (patchData) {
          returnEntries.push(patchData);
        }
      }
    }
    const recipientScores = [] as Array<RecipientScore>;
    // now, perform the loop to check if any of the notion data entries are marked as helpful
    for (const entry of notionData) {
      const isHelpful = entry.Helpful.checkbox;
      const wallet = entry.Wallet.rich_text[0]
        ? entry.Wallet.rich_text[0].text.content
        : "";
        const context = "feedback";
      const subContext = entry.Feedback.rich_text[0] ? entry.Feedback.rich_text[0].text.content : "";
      

      // ensure allocationData does not already have an entry where the wallet, context, and subContext match
      const isDuplicate = allocationData.allocations.some(
        (allocation) =>
          allocation.recipient === `did:pkh:eip155:1:${wallet.toLowerCase()}` &&
          allocation.context === context &&
          allocation.subContext === subContext,
      );

      // if all checks pass, then we can add the entry to the returnEntries array
      if (isHelpful && !isDuplicate) {
        recipientScores.push({
          recipient: `did:pkh:eip155:1:${wallet.toLowerCase()}`,
          score: 750,
          context,
          subContext,
        });
      }
    }
    // process and write the patches to Postgres
    const pgResults = await writeScoresToPg(recipientScores);
    console.log("Processed PG feedback patches: ", pgResults);

    // process and write the patches to Ceramic
    const results = await processSingleContextPoints(recipientScores);
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

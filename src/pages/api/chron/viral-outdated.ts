import { getNotion } from "@/utils/notion/index";
import { patchNotion } from "@/utils/notion/patch";
import { getTweet } from "@/utils/twitter/index";
import { getDeform } from "@/utils/deform/getDeformData";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type NotionViralType, type NotionViralEntry } from "@/types";

const NOTION_VIRAL_DATABASE_ID = process.env.NOTION_VIRAL_DATABASE_ID ?? "";
const DEFORM_VIRAL_FORM_ID = process.env.DEFORM_VIRAL_FORM_ID ?? "";

// interface Response extends NextApiResponse {
//   status(code: number): Response;
//   send(data: ObjectType[] | undefined | { error: string }): void;
// }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const notionData = (await getNotion(
      NOTION_VIRAL_DATABASE_ID,
      "Viral",
    )) as NotionViralType[];
    const deformData = await getDeform(DEFORM_VIRAL_FORM_ID).then((data) => {
      return data?.data;
    });

    // failure mode for fetching Notion or DeForm data
    if (!notionData || !deformData) {
      return res.status(500).send({ error: "Internal Server Error" });
    }

    // first, see if there is a difference between the number of rows in the Notion database and the number of rows in the DeForm database
    const difference = deformData.length - notionData.length;
    const returnEntries: NotionViralType[] = [];
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
        if (isUser && likesAboveTwo) {
          const entry: NotionViralEntry = {
            Username: {
              title: [
                {
                  text: {
                    content: user,
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
            Body: {
              rich_text: [
                {
                  text: {
                    content: tweetData.data.text,
                  },
                },
              ],
            },
            Likes: { number: likes.meta.result_count },
          };
          const patchData = await patchNotion(
            NOTION_VIRAL_DATABASE_ID,
            "Viral",
            entry,
          );
          if (patchData) {
            returnEntries.push(patchData);
          }
        }
      }
    }

    res.status(200).json(returnEntries);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

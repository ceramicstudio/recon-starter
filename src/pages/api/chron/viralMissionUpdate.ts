import { getNotion } from "@/utils/notion/index";
import { getDeform } from "@/utils/deform/getDeformData";
import {NextApiRequest, NextApiResponse} from "next";
import {type NotionViralType} from "@/types";

const NOTION_VIRAL_DATABASE_ID = process.env.NOTION_VIRAL_DATABASE_ID ?? "";
const DEFORM_VIRAL_FORM_ID = process.env.DEFORM_VIRAL_FORM_ID ?? "";

// interface Response extends NextApiResponse {
//   status(code: number): Response;
//   send(data: ObjectType[] | undefined | { error: string }): void;
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const notionData = await getNotion(NOTION_VIRAL_DATABASE_ID, "Viral") as NotionViralType[];
    res.status(200).json(notionData);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

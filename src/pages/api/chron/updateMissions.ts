import { getNotion } from "@/utils/notion/index";
import { patchMissions } from "@/utils/pg/patchMissions";
import { type NextApiResponse, type NextApiRequest } from "next";
import { type ObjectType } from "@/types";

const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID ?? "";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(data: ObjectType[] | undefined | { error: string }): void;
}

export default async function handler(_req: NextApiRequest, res: Response) {
  try {
    const data = await getNotion(NOTION_DATABASE_ID, "Onboarding") as ObjectType[];
    if (!data) {
      return res.status(500).send({ error: "Internal Server Error" });
    }
    const writtenData = await patchMissions(data);
    return res.status(200).json(writtenData);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
}

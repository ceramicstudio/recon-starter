import { getNotion } from "@/utils/notion/index";
import { patchMissions } from "@/utils/pg/patchMissions";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type ObjectType } from "@/types";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(data: ObjectType[] | undefined | { error: string }): void;
}

export default async function handler(req: NextApiRequest, res: Response) {
  try {
    const data = await getNotion();
    if (!data) {
      return res.status(500).send({ error: "Internal Server Error" });
    }
    const writtenData = await patchMissions(data);
    res.status(200).json(writtenData);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

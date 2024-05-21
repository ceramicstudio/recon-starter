import { getNotion } from "@/utils/notion/index";
import { type NextApiRequest, type NextApiResponse } from "next";
import { type ObjectType } from "@/types";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(data: ObjectType[] | undefined | { error: string }): void;
}

export default async function handler(req: NextApiRequest, res: Response) {
  try {
    const data = await getNotion();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

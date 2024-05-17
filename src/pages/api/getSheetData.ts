import { type NextApiRequest, type NextApiResponse } from "next";
import { getSheetData } from "@/utils/sheetData";
import { type Error } from "@/types";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(data: { rows: string[][] | undefined | null } | Error): void;
}

export default async function handler(req: NextApiRequest, res: Response) {
  try {
    const rows = (await getSheetData()) as string[][] | undefined | null;
    res.status(200).send({ rows });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

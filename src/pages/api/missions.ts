import {getMissions} from "@/utils/pg/getMissions";
import { type NextApiRequest, type NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const missions = await getMissions();
  res.status(200).json(missions);
}
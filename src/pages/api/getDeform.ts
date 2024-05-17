import { type NextApiRequest, type NextApiResponse } from "next";
import { type DeformResponse } from "@/types";
import { getDeform } from "@/utils/getDeformData";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(data: DeformResponse | { error: string } | undefined): void;
}

export default async function handler(req: NextApiRequest, res: Response) {
  try {
    const data = await getDeform();
    res.status(200).send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

import { type NextApiRequest, type NextApiResponse } from "next";
import { type DeformResponse } from "@/types";
import { getDeform } from "@/utils/deform/getDeformData";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(data: DeformResponse | { error: string } | undefined): void;
}

interface Request extends NextApiRequest {
  body: {
    formId: string;
  };
}

export default async function handler(req: Request, res: Response) {
  try {
    const data = await getDeform(req.body.formId);
    res.status(200).send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

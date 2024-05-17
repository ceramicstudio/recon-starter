import { type NextApiRequest, type NextApiResponse } from "next";
import { type Error } from "@/types";
import { passport } from "@/utils/submitPassport";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(
    data:
      | { score: string; address: string; last_score_timestamp: string }
      | Error,
  ): void;
}

interface Request extends NextApiRequest {
  body: {
    address: string;
    signature: string;
    nonce: string;
  };
}

export default async function handler(req: Request, res: Response) {
  try {
    const { address, signature, nonce } = req.body;
    const data = await passport(address, signature, nonce);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

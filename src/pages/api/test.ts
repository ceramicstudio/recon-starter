import { patchMissions } from "@/utils/pg/patchMissions";
import { getNotion } from "@/utils/notion/index";
import {totalsQueue} from "@/workers/totalAggregations.worker";
import { getTweet } from "@/utils/twitter/index";
import { type NextApiRequest, type NextApiResponse } from "next";

interface Response extends NextApiResponse {
  status(code: number): Response;
  send(
    data:
      | { score: string; address: string; last_score_timestamp: string }
      | { error: string },
  ): void;
}

export default async function handler(_req: NextApiRequest, res: Response) {
  try {
    // const data = await getNotion();
    // const newData = await patchMissions(data!);

    const data = await getTweet(
      "https://x.com/ceramicnetwork/status/1793330992347771257",
    );
    const data2 = {
      // any serializable data you want to provide for the job
      // for this example, we'll provide a message
      message: "This is a sample job",
    };
    await totalsQueue.add("totalsQueue", data2); 
    return res.status(200).json({ status: "Message added to the queue" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
}

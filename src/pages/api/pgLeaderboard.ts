import { type NextApiRequest, type NextApiResponse } from "next";
import { getPgTotalCount } from "@/utils/pg/pgAggregationCount";
import {getEnsForAddress} from "@/utils/getEns";
import type { Extended } from "@/types";

interface Request extends NextApiRequest {
  body: {
    count: number;
  };
}

export default async function getLeaderboard(req: Request, res: NextApiResponse) {
  try {
    const documents = await getPgTotalCount(req.body.count) as {
      aggregations: Extended[];
      aggregationCount: number;
    };
    
    // iterate through the documents and get the ENS for each address and add it to the document
    for (const doc of documents.aggregations) {
      const ens = await getEnsForAddress(doc.recipient.replace("did:pkh:eip155:1:", "")) ?? '';
      doc.ens = ens;
    }
    return res.json(documents);
  } catch (err) {
    res.json({
      err,
    });
  }
}

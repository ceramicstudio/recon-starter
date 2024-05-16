import { type NextApiRequest, type NextApiResponse } from "next";
import * as pg from "pg";

const ANSWERS = process.env.ANSWERS;

const STRING = process.env.DATABASE_URL;
const { Client, Pool } = pg;

export default async function updatePg(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!STRING) {
    return res.json({
      err: "Missing connection string",
    });
  }

  const pool = new Pool({
    connectionString: STRING,
  });

  await pool.query("SELECT NOW()");

  await pool.end();

  const client = new Client({
    connectionString: STRING,
  });

  try {
    await client.connect();

    // const stringified = JSON.stringify(obj);
    // const b64 = Buffer.from(stringified).toString("base64");

    return res.json({
      ANSWERS,
    });

    const checkAllocations = `SELECT * FROM SimplePointAggregation`;

    const vals = await client.query(checkAllocations);
    await client.end();

    return res.json({
      vals: vals
    });
  } catch (err) {
    res.json({
      err,
    });
  }
}

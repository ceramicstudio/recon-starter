import { issuer } from "./context";
import { type ContextAggregationContent } from "./types";
import * as pg from "pg";

const STRING = process.env.DATABASE_URL;
const { Client, Pool } = pg;

export const getPgContextAggregation = async (
  recipient: string,
  context: string,
): Promise<
  | {
      aggregation: ContextAggregationContent | Record<string, never>;
    }
  | undefined
> => {
  if (!STRING) {
    console.log("Missing connection string");
    return undefined;
  }

  const issuerId = issuer.id;

  try {
    const pool = new Pool({
      connectionString: STRING,
    });

    await pool.query("SELECT NOW()");
    await pool.end();

    const client = new Client({
      connectionString: STRING,
    });
    await client.connect();

    // Get all the total point aggregation entries for the issuer
    const totalPointAggregation = `SELECT * FROM context_point_aggregation WHERE issuer='${issuerId}' AND context='${context}' AND recipient='${recipient}'`;

    const aggregationDocs = (await client.query(totalPointAggregation)) as {
      rows: ContextAggregationContent[];
    };

    await client.end();
    return {
      aggregation: aggregationDocs.rows[0] ?? {},
    };
  } catch (Error) {
    return undefined;
  }
};

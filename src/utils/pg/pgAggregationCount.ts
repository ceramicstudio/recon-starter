import { issuer } from "../ceramic/context";
import { type PgTotalAggregation } from "../../types";
import * as pg from "pg";

const STRING = process.env.DATABASE_URL;
const { Client, Pool } = pg;

export const getPgTotalCount = async (count?: number): Promise<
  | {
      aggregations: PgTotalAggregation[];
      aggregationCount: number;
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
    const totalPointAggregation = `SELECT * FROM total_point_aggregation WHERE issuer='${issuerId}' ORDER BY points DESC ${count ? `LIMIT ${count}` : ""}`;

    const aggregationDocs = (await client.query(totalPointAggregation)) as {
      rows: PgTotalAggregation[];
    };

    await client.end();
    return {
      aggregations: aggregationDocs.rows,
      aggregationCount: aggregationDocs.rows.length,
    };
  } catch (Error) {
    return undefined;
  }
};

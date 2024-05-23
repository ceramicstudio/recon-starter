import { issuer } from "../ceramic/context";
import { type ContextAggregationContent } from "../../types";
import * as pg from "pg";

const STRING = process.env.DATABASE_URL;
const { Client, Pool } = pg;

export const getPgContextCount = async ( context: string): Promise<
  | {
      aggregations: ContextAggregationContent[];
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
    const contextPointAggregationQuery = `SELECT * FROM context_point_aggregation WHERE issuer='${issuerId}' AND context='${context}'`;

    const aggregationDocs = (await client.query(contextPointAggregationQuery)) as {
      rows: ContextAggregationContent[];
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

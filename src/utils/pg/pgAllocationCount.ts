import { issuer } from "../ceramic/context";
import { type AllocationContent } from "../../types";
import * as pg from "pg";

const STRING = process.env.DATABASE_URL;
const { Client, Pool } = pg;

export const getPgAllocationCount = async (
  context: string,
): Promise<
  | {
      allocations: AllocationContent[];
      allocationCount: number;
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
    const contextPointAllocationQuery = `SELECT * FROM context_point_allocation WHERE issuer='${issuerId}' AND context='${context}'`;

    const allocationDocs = (await client.query(
      contextPointAllocationQuery,
    )) as {
      rows: AllocationContent[];
    };

    await client.end();
    return {
      allocations: allocationDocs.rows,
      allocationCount: allocationDocs.rows.length,
    };
  } catch (Error) {
    return undefined;
  }
};

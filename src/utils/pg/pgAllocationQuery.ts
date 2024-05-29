import { issuer } from "../ceramic/context";
import { type AllocationContent } from "../../types";
import * as pg from "pg";

const STRING = process.env.DATABASE_URL;
const { Client, Pool } = pg;

export const getPgAllocation = async (
  recipient: string,
  context: string,
  subContext?: string,
  trigger?: string,
): Promise<
  | {
      allocations: AllocationContent[] | Record<string, never>;
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

    // Get a corresponding allocation entry for the context, issuer, and recipient
    const contextAllocation = (subContext?.length && trigger?.length) ? `SELECT * FROM context_point_allocation WHERE issuer='${issuerId}' AND context='${context}' AND subContext='${subContext}' AND trigger='${trigger}' AND recipient='${recipient}'` :  (subContext?.length) ? `SELECT * FROM context_point_allocation WHERE issuer='${issuerId}' AND context='${context}' AND subContext='${subContext}' AND recipient='${recipient}'` : (trigger?.length) ? `SELECT * FROM context_point_allocation WHERE issuer='${issuerId}' AND context='${context}' AND trigger='${trigger}' AND recipient='${recipient}'` : `SELECT * FROM context_point_allocation WHERE issuer='${issuerId}' AND context='${context}' AND recipient='${recipient}'`;

    const allocationDocs = (await client.query(contextAllocation)) as {
      rows: AllocationContent[];
    };

    await client.end();
    return {
      allocations: allocationDocs.rows,
    };
  } catch (Error) {
    return undefined;
  }
};

import { type RecipientScore } from "@/types";
import { issuer } from "../ceramic/context";
import * as pg from "pg";

const STRING = process.env.DATABASE_URL;
const { Client, Pool } = pg;

export const createPgPoints = async (score: RecipientScore) => {
  if (!STRING) {
    return {
      err: "Missing connection string",
    };
  }

  const issuerId = issuer.id;

  const transformedScore = {
    ...score,
    amount: score.score,
    multiplier: score.multiplier ?? 0,
  };

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

    //Query to determine if the recipient already has an entry in the total aggregation table 
    const totalPointAggregation = `SELECT * FROM total_point_aggregation WHERE recipient='${transformedScore.recipient}' AND issuer='${issuerId}'`;

    const totalAggregationDocs = await client.query(
      totalPointAggregation,
    );

    //Query to determine if the recipient already has an entry in the simple aggregation table based on the context
    const contextPointAggregation = `SELECT * FROM context_point_aggregation WHERE recipient='${transformedScore.recipient}' AND issuer='${issuerId}' AND context='${transformedScore.context}'`;

    const contextAggregationDocs = await client.query(
      contextPointAggregation,
    );
    
    // Insert new allocation entry
    const newAllocationEntry = `INSERT INTO context_point_allocation (issuer, recipient, points, date, context, multiplier) VALUES ('${issuerId}', '${transformedScore.recipient}', ${transformedScore.amount}, '${new Date().toISOString()}', '${transformedScore.context}', ${transformedScore.multiplier}) RETURNING *`;
    const allocationResult = await client.query(newAllocationEntry);

    let contextAggregationResult;

    if (contextAggregationDocs && contextAggregationDocs.rows.length === 0) {
      // Insert new context point aggregation entry
      const newContextAggregationEntry = `INSERT INTO context_point_aggregation (issuer, recipient, points, date, context) VALUES ('${issuerId}', '${transformedScore.recipient}', ${transformedScore.amount}, '${new Date().toISOString()}', '${transformedScore.context}') RETURNING *`;
      contextAggregationResult = await client.query(newContextAggregationEntry);
    } else if (contextAggregationDocs && contextAggregationDocs.rows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment , @typescript-eslint/no-unsafe-member-access
      const updatedContextPoints = contextAggregationDocs.rows[0].points + transformedScore.amount;

      // Update context point aggregation entry
      const updateContextAggregationEntry = `UPDATE context_point_aggregation SET points = ${updatedContextPoints} WHERE recipient = '${transformedScore.recipient}' AND issuer = '${issuerId}' AND context = '${transformedScore.context}' RETURNING *`;
      contextAggregationResult = await client.query(
        updateContextAggregationEntry,
      );
    }

    let totalAggregationResult;

    if (totalAggregationDocs && totalAggregationDocs.rows.length === 0) {
      // Insert new simple point aggregation entry
      const newSimpleAggregationEntry = `INSERT INTO total_point_aggregation (issuer, recipient, points, date) VALUES ('${issuerId}', '${transformedScore.recipient}', ${transformedScore.amount}, '${new Date().toISOString()}') RETURNING *`;
      totalAggregationResult = await client.query(newSimpleAggregationEntry);
    } else if (totalAggregationDocs && totalAggregationDocs.rows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment , @typescript-eslint/no-unsafe-member-access
      const updatedPoints = totalAggregationDocs.rows[0].points + transformedScore.amount;
      // Update simple point aggregation entry
      const updateSimpleAggregationEntry = `UPDATE total_point_aggregation SET points = ${updatedPoints} WHERE recipient = '${transformedScore.recipient}' AND issuer = '${issuerId}' RETURNING *`;
      totalAggregationResult = await client.query(
        updateSimpleAggregationEntry,
      );
    }

    await client.end();
    return {
      allocationResult: allocationResult.rows ?? [],
      contextAggregationResult: contextAggregationResult?.rows ?? [],
      totalAggregationResult: totalAggregationResult?.rows ?? [],
    };
  } catch (Error) {
    return undefined;
  }
};

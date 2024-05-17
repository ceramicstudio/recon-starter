import { type ScoreInput } from "../../types";
import * as pg from "pg";

const STRING = process.env.DATABASE_URL;
const { Client, Pool } = pg;

const questions = [
  "How would you like to participate in the ecosystem?",
  "Are you technical?",
  "On a scale of 1-10, how excited are you about what ADM?",
  "What is your X username? - Twitter Username",
  "What is your email address?",
  "What is your wallet address? - Wallet Address",
  "What is your Discord handle? - Discord Display Name",
  "What is your Discord handle? - Discord User ID",
];

export const saveCustomers = async (input: ScoreInput) => {
  try {
    if (!STRING) {
      return {
        err: "Missing connection string",
      };
    }

    const pool = new Pool({
      connectionString: STRING,
    });

    await pool.query("SELECT NOW()");
    await pool.end();

    const client = new Client({
      connectionString: STRING,
    });
    await client.connect();

    const { rows, startRow } = input;

    // first start at startRow index while iterating through entry
    for (let i = startRow; i < rows.length; i++) {
      // iterate through questions and find the relevant answer object based on if the name matches the key
      const answers = rows[i]?.answers;

     // need to finish
      
    }
    await client.end();
    return;
  } catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};

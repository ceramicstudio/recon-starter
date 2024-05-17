import { type ScoreInput } from "../../types";
import * as pg from "pg";

const STRING = process.env.DATABASE_URL;
const { Client, Pool } = pg;

const questions: Record<string, string> = {
  participant: "How would you like to participate in the ecosystem?",
  technical: "Are you technical?",
  excitement: "On a scale of 1-10, how excited are you about what ADM?",
  xUsername: "What is your X username? - Twitter Username",
  email: "What is your email address?",
  address: "What is your wallet address? - Wallet Address",
  discordHandle: "What is your Discord handle? - Discord Display Name",
  discordId: "What is your Discord handle? - Discord User ID",
};

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

    const saved = [];
    // first start at startRow index while iterating through entry
    for (let i = startRow; i < rows.length; i++) {
      const userAnswers = {} as Record<string, string | string[] | undefined>;
      // iterate through questions and find the relevant answer object based on if the name matches the key
      const answers = rows[i]?.answers;

      for (const key in questions) {
        // locate the correct answer as a string
        const question = questions[key];
        const answer = answers?.find((answer) => answer.name === question);
        userAnswers[key] = answer?.value;
      }
      const saveCustomerQuery = `INSERT INTO customers (participant, technical, excitement, xUsername, email, address, discordHandle, discordId) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
      const saveCustomer = await client.query(saveCustomerQuery, [
        userAnswers.participant,
        userAnswers.technical ? userAnswers.technical[0] === "Yes" : false,
        Number(userAnswers.excitement),
        userAnswers.xUsername,
        userAnswers.email,
        userAnswers.address,
        userAnswers.discordHandle,
        userAnswers.discordId,
      ]);
      saved.push(saveCustomer.rows[0]);
    }
    await client.end();
    return saved as Array<Record<string, string | number | string[] | boolean>>;
  } catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};

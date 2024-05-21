import { type PgMission } from "@/types";
import * as pg from "pg";

const STRING = process.env.DATABASE_URL;
const { Client, Pool } = pg;

export const getMissions = async (): Promise<PgMission[] | undefined> => {
  if (!STRING) {
    console.log("Missing connection string");
    return undefined;
  }

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
    const missionQuery = `SELECT * FROM missions`;
    const returnData = (await client.query(missionQuery)) as {
      rows: PgMission[];
    };

    await client.end();

    return returnData.rows ?? undefined;
  } catch (Error) {
    return undefined;
  }
};

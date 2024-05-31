import { type PgMission, type ObjectType } from "@/types";
import * as pg from "pg";

const STRING = process.env.DATABASE_URL;
const { Client, Pool } = pg;

export const patchMissions = async (
  data: ObjectType[],
): Promise<PgMission[] | undefined> => {
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
    const returnData = [];
    // Loop through the data and update the missions table

    for (const item of data) {
      const name = item.Name.title[0]?.text.content;
      const description =
        item.Description.rich_text.length && item.Description.rich_text[0]
          ? item.Description.rich_text[0].text.content
          : undefined;
      const difficulty =
        item.Difficulty.select !== null
          ? item.Difficulty.select.name
          : undefined;
      const season =
        item.Season.select !== null ? item.Season.select.name : undefined;
      const start =
        item.Start.date !== null ? item.Start.date.start : undefined;
      const active = item.Active.checkbox;
      const persona =
        item.Persona.select !== null ? item.Persona.select.name : undefined;
      const duration =
        item.Duration.select !== null ? item.Duration.select.name : undefined;
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      const url = item.URL.url !== null ? item.URL.url : undefined;
      const featured = item.Featured.checkbox;
      const frequency =
        item.Frequency.select !== null ? item.Frequency.select.name : undefined;
      const points = item.Points.rich_text[0]
        ? item.Points.rich_text[0].text.content
        : undefined;
      if (
        name &&
        description &&
        difficulty &&
        season &&
        persona &&
        duration &&
        frequency &&
        points &&
        active !== undefined &&
        featured !== undefined
      ) {
        // create a query that will upsert the missions table but omits url and start date
        const query = `INSERT INTO missions (name, description, points, difficulty, persona, duration, frequency, season, active, featured) VALUES ('${name}', '${description}', '${points}', '${difficulty}', '${persona}', '${duration}', '${frequency}', '${season}', ${active}, ${featured}) ON CONFLICT (name) DO UPDATE SET description = '${description}', points = '${points}', difficulty = '${difficulty}', persona = '${persona}', duration = '${duration}', frequency = '${frequency}', season = '${season}', active = ${active}, featured = ${featured} RETURNING *`;
        const res = await client.query(query);
        returnData.push(res.rows[0]);
        // if start is not undefined, update the start date
        if (start !== undefined) {
          const updateStart = `UPDATE missions SET startDate = '${start}' WHERE name = '${name}' RETURNING *`;
          const startRes = await client.query(updateStart);
          returnData.push(startRes.rows[0]);
        }
        // if url is not undefined, update the url
        if (url !== undefined && url !== null) {
          const updateUrl = `UPDATE missions SET url = '${url}' WHERE name = '${name}' RETURNING *`;
          const urlRes = await client.query(updateUrl);
          returnData.push(urlRes.rows[0]);
        }
      }
    }

    await client.end();
    return returnData as PgMission[];
  } catch (Error) {
    return undefined;
  }
};

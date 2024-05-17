// import { type NextApiRequest, type NextApiResponse } from "next";
// import * as pg from "pg";

// const STRING = process.env.DATABASE_URL;
// const { Client, Pool } = pg;

// export default async function updatePg(
//   req: NextApiRequest,
//   res: NextApiResponse,
// ) {
//   if (!STRING) {
//     return res.json({
//       err: "Missing connection string",
//     });
//   }

//   const pool = new Pool({
//     connectionString: STRING,
//   });

//   await pool.query("SELECT NOW()");

//   await pool.end();

//   const client = new Client({
//     connectionString: STRING,
//   });

//   try {
//     await client.connect();
//     const ContextPointAggregationString = `
//   CREATE TABLE context_point_aggregation (
//     id SERIAL PRIMARY KEY,
//     issuer text,
//     recipient text,
//     points integer,
//     date text,
//     context text)
// `;

//     const TotalPointAggregationString = `
//   CREATE TABLE total_point_aggregation (
//     id SERIAL PRIMARY KEY,
//     issuer text,
//     recipient text,
//     points integer,
//     date text,
//     verified boolean)
// `;

// const PersonTableString = `
//   CREATE TABLE customers (
//     id SERIAL PRIMARY KEY,
//     participant text[],
//     technical boolean,
//     excitement integer,
//     xUsername text,
//     email text,
//     address text,
//     discordHandle text,
//     discordId text)
// `;

//     const ContextPointAllocationString = `
// CREATE TABLE context_point_allocation (
//   id SERIAL PRIMARY KEY,
//   issuer text,
//   recipient text,
//   points integer,
//   date text,
//   context text,
//   multiplier integer)
// `;

//     const SimplePointAllocationString = `
// CREATE TABLE simple_point_allocation (
//   id SERIAL PRIMARY KEY,
//   issuer text,
//   recipient text,
//   points integer)
// `;
//     await client.query(ContextPointAggregationString);
//     await client.query(TotalPointAggregationString);
//     await client.query(ContextPointAllocationString);
//     await client.query(SimplePointAllocationString);
//     await client.query(PersonTableString);

//     const vals = await client.query("SELECT * FROM pg_catalog.pg_tables");
//     await client.end();

//     return res.json({
//       vals,
//     });
//   } catch (err) {
//     res.json({
//       err,
//     });
//   }
// }

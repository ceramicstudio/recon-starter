import { PointsWriter, PointsReader } from "@ceramic-solutions/points";
import { getAuthenticatedDID } from "@ceramic-solutions/key-did";
import { fromString } from "uint8arrays";
import { ComposeClient } from "@composedb/client";
import { definition } from "@/utils/ceramic/definition";
import type { RuntimeCompositeDefinition } from "@composedb/types";
import dotenv from "dotenv";

dotenv.config();
const {
  CERAMIC_PRIVATE_KEY,
  CERAMIC_API_1,
  CERAMIC_API_2,
  AGGREGATION_ID,
  ALLOCATION_ID,
  VERIFIED_TOTAL_ID,
} = process.env;

const ceramicOne = CERAMIC_API_1 ?? "";
const ceramicTwo = CERAMIC_API_2 ?? "";
const private_key: string = CERAMIC_PRIVATE_KEY ?? "";
const aggregationModelID: string | undefined = AGGREGATION_ID ?? undefined;
const allocationModelID: string | undefined = ALLOCATION_ID ?? undefined;
const totalAggregationModelID: string | undefined =
  VERIFIED_TOTAL_ID ?? undefined;

//eslint-disable-next-line
const seed = fromString(private_key, "base16") as Uint8Array;

// create a context writer
const contextWriterOne = await PointsWriter.fromSeed({
  aggregationModelID,
  allocationModelID,
  seed,
  ceramic: ceramicOne,
});

// create a second context writer
const contextWriterTwo = await PointsWriter.fromSeed({
  aggregationModelID,
  allocationModelID,
  seed,
  ceramic: ceramicTwo,
});

// create a total writer
const writerOne = await PointsWriter.fromSeed({
  aggregationModelID: totalAggregationModelID,
  seed,
  ceramic: ceramicOne,
});

// create a second total writer
const writerTwo = await PointsWriter.fromSeed({
  aggregationModelID: totalAggregationModelID,
  seed,
  ceramic: ceramicTwo,
});

// generate issuer for reader context
const issuer = await getAuthenticatedDID(seed);

//create a context reader
const contextReaderOne = PointsReader.create({
  issuer: issuer.id,
  aggregationModelID,
  allocationModelID,
  ceramic: ceramicOne,
});

// create a second context reader
const contextReaderTwo = PointsReader.create({
  issuer: issuer.id,
  aggregationModelID,
  allocationModelID,
  ceramic: ceramicTwo,
});

//create a total reader
const readerOne = PointsReader.create({
  aggregationModelID: totalAggregationModelID,
  issuer: issuer.id,
  ceramic: ceramicOne,
});

// create a second total reader
const readerTwo = PointsReader.create({
  aggregationModelID: totalAggregationModelID,
  issuer: issuer.id,
  ceramic: ceramicTwo,
});

//instantiate a composeDB client instance
const composeClientOne = new ComposeClient({
  ceramic: ceramicOne,
  definition: definition as RuntimeCompositeDefinition,
});

// instantiate a composeDB client instance
const composeClientTwo = new ComposeClient({
  ceramic: ceramicTwo,
  definition: definition as RuntimeCompositeDefinition,
});

export {
  contextWriterOne,
  contextWriterTwo,
  writerOne,
  writerTwo,
  contextReaderOne,
  contextReaderTwo,
  readerOne,
  readerTwo,
  composeClientOne,
  composeClientTwo,
  issuer,
};

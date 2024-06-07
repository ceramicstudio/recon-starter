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
  CERAMIC_API,
  AGGREGATION_ID,
  ALLOCATION_ID,
  VERIFIED_TOTAL_ID,
} = process.env;

const ceramic = CERAMIC_API ?? "";
const private_key: string = CERAMIC_PRIVATE_KEY ?? "";
const aggregationModelID: string | undefined = AGGREGATION_ID ?? undefined;
const allocationModelID: string | undefined = ALLOCATION_ID ?? undefined;
const totalAggregationModelID: string | undefined =
  VERIFIED_TOTAL_ID ?? undefined;

//eslint-disable-next-line
const seed = fromString(private_key, "base16") as Uint8Array;

// create a context writer
const contextWriter = await PointsWriter.fromSeed({
  aggregationModelID,
  allocationModelID,
  seed,
});

// create a total writer
const writer = await PointsWriter.fromSeed({
  aggregationModelID: totalAggregationModelID,
  seed,
});

// generate issuer for reader context
const issuer = await getAuthenticatedDID(seed);

//create a context reader
const contextReader = PointsReader.create({
  issuer: issuer.id,
  aggregationModelID,
  allocationModelID,
});

//create a total reader
const reader = PointsReader.create({
  aggregationModelID: totalAggregationModelID,
  issuer: issuer.id,
});

//instantiate a composeDB client instance
const composeClient = new ComposeClient({
  ceramic,
  definition: definition as RuntimeCompositeDefinition,
});

export { contextWriter, writer, contextReader, reader, composeClient, issuer };

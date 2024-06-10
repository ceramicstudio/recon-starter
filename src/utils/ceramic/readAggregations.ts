import { contextWriterOne, contextWriterTwo, writerOne, writerTwo } from "./context";
import {checkCeramicFast} from "@/workers/ceramicCheck";
import type { ModelInstanceDocument } from "@composedb/types";
import { type AggregationContent } from "@/types";

export const getAggregation = async (recipient: string, context?: string) => {
  try {
    let aggregationDoc: ModelInstanceDocument<AggregationContent> | null = null;

    // first check which ceramic client to use
    const writer = await checkCeramicFast() === 1 ? writerOne : writerTwo;
    const contextWriter = await checkCeramicFast() === 1 ? contextWriterOne : contextWriterTwo;

    if (context) {
      // get context aggregation doc if exists
      aggregationDoc = await contextWriter.loadAggregationDocumentFor([
        recipient,
        context,
      ]);
    } else {
      // get total aggregation doc if exists
      aggregationDoc = await writer.loadAggregationDocumentFor([
        recipient,
      ]);
    }

    return aggregationDoc;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

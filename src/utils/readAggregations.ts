import { contextWriter, writer } from "./context";
import type { ModelInstanceDocument } from "@composedb/types";
import { type AggregationContent } from "@/utils/types";

export const getAggregation = async (recipient: string, context?: string) => {
  try {
    let aggregationDoc: ModelInstanceDocument<AggregationContent> | null = null;

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

import { contextWriter } from "./context";
import type { ModelInstanceDocument } from "@composedb/types";
import { type AggregationContent } from "@/utils/types";

export const getAggregation = async (recipient: string, context: string) => {
  try {
    // get context aggregation doc if exists
    const aggregationDoc: ModelInstanceDocument<AggregationContent> | null =
      await contextWriter.loadAggregationDocumentFor([recipient, context]);
    return aggregationDoc;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

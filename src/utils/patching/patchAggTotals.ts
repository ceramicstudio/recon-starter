import { getPgTotalCount } from "@/utils/pg/pgAggregationCount";
import { readAggTotals } from "@/utils/ceramic/readAggTotals";
import { type PgTotalAggregation } from "../../types";

export const patchAggTotals = async () => {
  try {
    const data = await getPgTotalCount();
    if (!data) {
      return {
        error: "Issue with getting PG total aggregation data",
      };
    }
    const total: number = data.aggregationCount;
    const aggregations: PgTotalAggregation[] = data.aggregations.sort((a, b) =>
      b.recipient < a.recipient ? 1 : -1,
    );
    const recipientsFromAggregations = aggregations.map((agg) => agg.recipient);
    const graphQlGroupings = total > 1000 ? Math.ceil(total / 1000) : 1;
    const totals: PgTotalAggregation[] = [];
    for (let i = 0; i < graphQlGroupings; i++) {
      const first = 1000;
      const skip = i * first;
      const slice = recipientsFromAggregations.slice(skip, first);
      const total = await readAggTotals({ recipients: slice });
      if (total) {
        totals.push(...total);
      }
    }
    // do something with totals
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

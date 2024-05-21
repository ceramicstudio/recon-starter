import { getPgTotalCount } from "@/utils/pg/pgAggregationCount";
import { readAggTotals } from "@/utils/ceramic/readAggTotals";
import { createPatchedTotalAgg } from "@/utils/ceramic/createPoints";
import { type PgTotalAggregation, type AggTotalContent } from "../../types";

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
    const totals: AggTotalContent[] = [];
    for (let i = 0; i < graphQlGroupings; i++) {
      const first = 1000;
      const skip = i * first;
      const slice = recipientsFromAggregations.slice(skip, first);
      const total = await readAggTotals({ recipients: slice });
      if (total) {
        totals.push(...total);
      }
    }

    // iterate through aggregations and check that there's a corresponding total in the totals array (based on recipient) with the same points value
    // if there is no corresponding object for that recipient in the totals array, or if the points value is different, add the total to a new array
    const totalsToPatch = [];
    for (const agg of aggregations) {
      const total = totals.find(
        (total) => total.node.recipient.id === agg.recipient,
      );
      if (!total || total.node.points !== agg.points) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // create a new total with the recipient, date, points, and verified status on Ceramic
        const patchedTotal = await createPatchedTotalAgg(
          agg.recipient,
          agg.date,
          agg.points,
          agg.verified,
        );
        if (patchedTotal) {
          totalsToPatch.push(patchedTotal);
        }
      }
    }

    return totalsToPatch;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

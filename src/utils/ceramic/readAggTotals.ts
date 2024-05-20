import { composeClient, issuer } from "@/utils/ceramic/context";
import { type PgTotalAggregation } from "@/types";

export const readAggTotals = async ({
  recipients,
}: {
  recipients: string[];
}): Promise<PgTotalAggregation[] | undefined> => {
  try {
    const filterString = recipients
      .map((recipient, index) => {
        if (index === 0) {
          return `{ where: { recipient: { equalTo: "${recipient}" } } }`;
        } else {
          return `{ or: { where: { recipient: { equalTo: "${recipient}" } } } }`;
        }
      })
      .join(", ");
    const aggregations = await composeClient.executeQuery<{
      node: {
        totalPointsAggregationList: {
          edges: PgTotalAggregation[];
        };
      };
    }>(`
      query GetAggregations {
        node(id: "${issuer.id}") {
          ... on CeramicAccount {
            totalPointsAggregationList(first: 1000, filters: { or: [${filterString}] }, sorting: { recipient: ASC }) {
                edges {
                    node {
                        id
                        points
                        issuer {
                            id
                        }
                        date
                        recipient {
                            id
                        }
                        verified
                    }
                }
            }
            }
          }
        }
      `);
    if (aggregations?.data?.node?.totalPointsAggregationList?.edges.length) {
      return aggregations.data.node.totalPointsAggregationList.edges;
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

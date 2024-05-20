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
    console.log(filterString);
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
            totalPointsAggregationList(first: 1000, filters: { or: [${filterString}] }) {
                edges {
                    node {
                        id
                        points
                        issuer {
                            id
                        }
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

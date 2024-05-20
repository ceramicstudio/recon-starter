import { composeClient, issuer } from "@/utils/ceramic/context";

export const getAggregationCount = async (): Promise<number | undefined> => {
    try {
      const aggregations = await composeClient.executeQuery<{
        node: {
          totalPointsAggregationListCount: number;
        };
      }>(`
      query GetAggregations {
        node(id: "${issuer.id}") {
          ... on CeramicAccount {
               totalPointsAggregationListCount
              }
            }
          }
      `);
      
      if (aggregations?.data?.node) {
        return aggregations?.data?.node?.totalPointsAggregationListCount;
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };
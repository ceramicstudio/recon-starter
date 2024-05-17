import { composeClient, issuer } from "@/utils/ceramic/context";

export const getAggregationCount = async (): Promise<number | undefined> => {
    try {
      const aggregations = await composeClient.executeQuery<{
        node: {
          totalPointAggregationListCount: number;
        };
      }>(`
      query GetAggregations {
        node(id: "${issuer.id}") {
          ... on CeramicAccount {
               totalPointAggregationListCount
              }
            }
          }
      `);
      
      if (aggregations?.data?.node) {
        return aggregations?.data?.node?.totalPointAggregationListCount;
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };
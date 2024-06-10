import { composeClientOne, composeClientTwo, issuer } from "@/utils/ceramic/context";
import {checkCeramicFast} from "@/workers/ceramicCheck";

export const getAggregationCount = async (): Promise<number | undefined> => {
    try {
      // first check which ceramic client to use
      const composeClient = await checkCeramicFast() === 1 ? composeClientOne : composeClientTwo;
      
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
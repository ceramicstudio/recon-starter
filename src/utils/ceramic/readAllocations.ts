import { composeClientOne, composeClientTwo, issuer } from "./context";
import {checkCeramicFast} from "@/workers/ceramicCheck";
import { type AllocationNode } from "@/types";

export const getAllocations = async (recipient: string, context: string) => {
  try {
    // first check which ceramic client to use
    const composeClient = await checkCeramicFast() === 1 ? composeClientOne : composeClientTwo;
    
    const allocations = await composeClient.executeQuery<{
      node: {
        contextPointAllocationList: {
          edges: AllocationNode[];
        };
      };
    }>(`
      query GetAllocations {
        node(id: "${issuer.id}") {
          ... on CeramicAccount {
               contextPointAllocationList(
                filters: {
                  and: [
                    { where: { recipient: { equalTo: "${recipient}" } } }
                    { and: { where: { context: { equalTo: "${context}" } } } }
                  ]
                }, 
                first: 1000) {
                  edges {
                    node {
                        id
                        context
                        issuer {
                          id
                        }
                        recipient {
                          id
                        }
                        points
                        multiplier
                        subContext
                        trigger
                     }
                  }
                }
              }
            }
          }
      `);
      console.log(allocations.data?.node.contextPointAllocationList.edges)
    if (allocations?.data?.node?.contextPointAllocationList?.edges.length) {
      return allocations.data.node.contextPointAllocationList.edges;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

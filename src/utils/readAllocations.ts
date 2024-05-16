import { composeClient, issuer } from "./context";
import { type AllocationNode } from "@/utils/types";

export const getAllocations = async (recipient: string, context: string) => {
  try {
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

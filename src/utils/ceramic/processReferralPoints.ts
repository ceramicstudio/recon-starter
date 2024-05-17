import { type RecipientScore, type NewPoints } from "../../types";
import { createPoints } from "./createPoints";
import { getAggregation } from "@/utils/ceramic/readAggregations";

export const processReferralPoints = async (scores: Array<RecipientScore>) => {
  try {
    
    // iterate over each score and check if the recipient's aggregation doc's points value does not match the score's points value
    const results = [];


    for (const score of scores) {
      const response = await getAggregation(score.recipient, score.context);
      if (
        response?.content?.points !== undefined &&
        score.score > response?.content?.points
      ) {
        // determine the difference between the score's points value and the recipient's aggregation doc's points value
        const difference = score.score - (response?.content?.points ?? 0);
        // determine the number of iterations needed to reach the score's points value
        const numOfIterations = difference / 100;

        for (let i = 0; i < numOfIterations; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          // create points with the recipient's aggregation doc's points value + 100
          const newScore = {
            recipient: score.recipient,
            score: 100,
            context: score.context,
            amount: 100,
            multiplier: score.multiplier,
          };
          const newPoints = await createPoints(newScore);
          results.push(newPoints);
        }
      }
    }
    return results as Array<NewPoints> | undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

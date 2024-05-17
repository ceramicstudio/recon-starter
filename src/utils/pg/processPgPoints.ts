import { type RecipientScore } from "../types";
import { createPgPoints } from "./pg";
import { getPgContextAggregation } from "@/utils/pg/pgGeneralQuery";

export const processReferralPgPoints = async (
  scores: Array<RecipientScore>,
) => {
  try {
    // iterate over each score and check if the recipient's aggregation doc's points value does not match the score's points value
    const results = [];

    // keep track of PG array
    const pgArray = [];

    for (const score of scores) {
      const response = await getPgContextAggregation(
        score.recipient,
        score.context,
      );
      if (
        response?.aggregation.points !== undefined &&
        score.score > response?.aggregation?.points
      ) {
        // determine the difference between the score's points value and the recipient's aggregation doc's points value
        const difference = score.score - (response?.aggregation?.points ?? 0);
        // determine the number of iterations needed to reach the score's points value
        const numOfIterations = difference / 100;

        for (let i = 0; i < numOfIterations; i++) {
          // create points with the recipient's aggregation doc's points value + 100
          const newScore = {
            recipient: score.recipient,
            score: 100,
            context: score.context,
            amount: 100,
            multiplier: score.multiplier,
          };
          results.push(newScore);
          pgArray.push(newScore);
        }
      }
    }
    await writeScoresToPg(pgArray);
    return results;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

export const writeScoresToPg = async (scores: Array<RecipientScore>) => {
  try {
    const results = [];
    for (const score of scores) {
      // wait for 50ms before writing to PG
      await new Promise((resolve) => setTimeout(resolve, 50));
      const response = await createPgPoints(score);
      results.push(response);
    }
    return results;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

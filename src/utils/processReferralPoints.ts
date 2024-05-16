import { type RecipientScore, type NewPoints } from "./types";
import { createPoints } from "./createPoints";
import { createPgPoints } from "./pg";
import { getAggregation } from "@/utils/readAggregations";
import { getPgContextAggregation } from "@/utils/pgGeneralQuery";

export const processReferralPoints = async (scores: Array<RecipientScore>) => {
  try {
    
    // iterate over each score and check if the recipient's aggregation doc's points value does not match the score's points value
    const results = [];


    for (const score of scores) {
      score.recipient = `did:pkh:eip155:1:${score.recipient.toLowerCase()}`;
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

export const processReferralPgPoints = async (
  scores: Array<RecipientScore>,
) => {
  try {
    // iterate over each score and check if the recipient's aggregation doc's points value does not match the score's points value
    const results = [];

    // keep track of PG array
    const pgArray = [];

    for (const score of scores) {
      score.recipient = `did:pkh:eip155:1:${score.recipient.toLowerCase()}`;
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

const writeScoresToPg = async (scores: Array<RecipientScore>) => {
  try {
    const results = [];
    for (const score of scores) {
      const response = await createPgPoints(score);
      results.push(response);
    }
    console.log("Results: ", results);
    return results;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

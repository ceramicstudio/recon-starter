import { type RecipientScore, type NewPoints } from "./types";
import { createPoints } from "./createPoints";
import { getAllocations } from "./readAllocations";
import { createPgPoints } from "./pg";

export const processSingleContextPoints = async (
  scores: Array<RecipientScore>,
) => {
  try {
    // write scores to Postgres
    await writeScoresToPg(scores);
    const results = [];
    for (const score of scores) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      score.recipient = `did:pkh:eip155:1:${score.recipient.toLowerCase()}`;
      const response = await getAllocations(score.recipient, score.context);
      if (response === undefined || response.length === 0) {
        console.log("Processing score for: ", score.recipient);
        const newPoints = await createPoints(score);
        results.push(newPoints);
      }
    }
    return results as Array<NewPoints> | undefined;
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

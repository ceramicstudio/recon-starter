import { type RecipientScore, type NewPoints } from "../../types";
import { createPoints } from "./createPoints";
import { getAllocations } from "./readAllocations";

export const processSingleContextPoints = async (
  scores: Array<RecipientScore>,
) => {
  try {
    const results = [];
    for (const score of scores) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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

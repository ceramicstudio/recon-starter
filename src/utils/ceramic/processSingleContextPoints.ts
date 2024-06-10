import { type RecipientScore } from "@/types";
import { createPoints } from "./createPoints";
import { getAllocations } from "./readAllocations";

export const processSingleContextPoints = async (
  scores: Array<RecipientScore>,
) => {
  try {
    for (const score of scores) {
      const response = await getAllocations(score.recipient, score.context);
      if (response === undefined || response.length === 0) {
        await createPoints(score);
      }
    }
    return { message: "Successfully processed scores" };
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

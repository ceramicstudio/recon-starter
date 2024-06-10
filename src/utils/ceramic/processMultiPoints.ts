import { type RecipientScore } from "@/types";
import { createPoints } from "./createPoints";

export const processMultiPoints = async (scores: Array<RecipientScore>) => {
  try {
    for (const score of scores) {
      await createPoints(score);
    }
    return { message: "Successfully processed scores" };
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

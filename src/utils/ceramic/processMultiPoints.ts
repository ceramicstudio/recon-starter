import { type RecipientScore, type NewPoints } from "../../types";
import { createPoints } from "./createPoints";

export const processMultiPoints = async (scores: Array<RecipientScore>) => {
  try {
    // const results = [];
    for (const score of scores) {
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      // console.log("Processing score for: ", score.recipient);
      // const newPoints = await createPoints(score);
      await createPoints(score);
      // results.push(newPoints);
    }
    // return results as Array<NewPoints> | undefined;
    return { message: "Successfully processed scores" };
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

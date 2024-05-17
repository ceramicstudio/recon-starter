import { type ScoreInput, type RecipientScore } from "./types";

const ANSWERS = process.env.ANSWERS ?? "";

export const calculate = async (
  input: ScoreInput,
): Promise<Array<RecipientScore> | { error: string }> => {
  try {
    const { rows, startRow } = input;
    const recipientScores = [] as Array<RecipientScore>;

    //turn b64 string encoded ANSWERS into a string
    const decoded = Buffer.from(ANSWERS, "base64").toString("utf-8");

    //turn decoded string into an object
    const obj = JSON.parse(decoded) as Record<string, string[]>;

    // first start at startRow index while iteration through entry
    for (let i = startRow; i < rows.length; i++) {
      let score = 0;
      const answers = rows[i]?.answers;

      // iterate through the object keys
      for (const key in obj) {
        // locate the correct answer as a string
        const correctAnswer = obj[key]?.join(" ");

        // find the relevant answer object based on if the name matches the key
        const answer = answers?.find((answer) => answer.name === key);

        //transform the answer into a string
        const userAnswer =
          typeof answer?.value === "string"
            ? answer.value
            : answer?.value.join(" ");

        // if the answer matches the correct answer, increment the score
        if (correctAnswer === userAnswer) {
          score += 20;
        }
      }
      // find the wallet address
      const address = answers?.find(
        (answer) =>
          answer.name === "What is your wallet address? - Wallet Address",
      )?.value;

      if (!address || typeof address !== "string") {
        return { error: "Internal Server Error" };
      }
      // add the quiz scores to the recipientScores array
      recipientScores.push({
        recipient: `did:pkh:eip155:1:${address.toLowerCase()}`,
        score,
        context: `Onboarding Quiz`,
      });

      // add the rewards for connecting X
      recipientScores.push({
        recipient: `did:pkh:eip155:1:${address.toLowerCase()}`,
        score: 50,
        context: `Twitter`,
      });

      // add the rewards for connecting Discord
      recipientScores.push({
        recipient: `did:pkh:eip155:1:${address.toLowerCase()}`,
        score: 50,
        context: `Discord`,
      });

      // add the rewards for subscribing email
      recipientScores.push({
        recipient: `did:pkh:eip155:1:${address.toLowerCase()}`,
        score: 50,
        context: `Email`,
      });

      // reset the score
      score = 0;
    }
    // return the recipient scores
    return recipientScores;
  } catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};

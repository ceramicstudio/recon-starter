import { type ScoreReferralInput, type RecipientScore } from "./types";

export const calculateReferrals = async (
  input: ScoreReferralInput,
): Promise<Array<RecipientScore> | { error: string }> => {
  try {
    const { rows, startRow, chron } = input;
    const referralScores = [] as Array<RecipientScore>;

    rows.forEach((row, index) => {
      // if the row is a new entry
      if (!chron) {
        if (index >= input.startRow) {
          const address = row.answers.find(
            (answer) =>
              answer.name === "What is your wallet address? - Wallet Address",
          )?.value;
            
          const referrals = row.waitlistInfo?.referralCount;
          const score = referrals ? referrals * 100 : 0;
          if (typeof address === "string") {
            referralScores.push({
              recipient: `did:pkh:eip155:1:${address.toLowerCase()}`,
              score,
              context: "Referral",
            });
          }
        }
      } else {
        // switch case for when the run is to patch existing entries
        if (index < startRow) {
          const address = row.answers.find(
            (answer) =>
              answer.name === "What is your wallet address? - Wallet Address",
          )?.value;
          
          const referrals = row.waitlistInfo?.referralCount;
          const score = referrals ? referrals * 100 : 0;
          if (typeof address === "string") {
            referralScores.push({
              recipient: `did:pkh:eip155:1:${address.toLowerCase()}`,
              score,
              context: "Referral",
            });
          }
        }
      }
    });

    // return the recipient scores
    return referralScores;
  } catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};

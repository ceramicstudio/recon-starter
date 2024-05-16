import axios from "axios";

const GITCOIN_API_KEY = process.env.GITCOIN_API_KEY ?? "";
const SCORER_ID = process.env.SCORER_ID ?? "";

export const passport = async (
  address: string,
  signature: string,
  nonce: string,
) => {
  try {
    const data = await submitPassport(address, signature, nonce);
    return data;
  } catch (error) {
    console.error(error);
    return { error: "Error retrieving passport" };
  }
};

const submitPassport = async (
  address: string,
  signature: string,
  nonce: string,
) => {
  const submitPassportConfig = {
    headers: {
      "X-API-KEY": GITCOIN_API_KEY,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  const submitPassportData = {
    address,
    scorer_id: SCORER_ID,
    signature,
    nonce,
  };
  const { data } = await axios.post<{
    score: string;
    address: string;
    last_score_timestamp: string;
  }>(
    "https://api.scorer.gitcoin.co/registry/submit-passport",
    submitPassportData,
    submitPassportConfig,
  );
  return data;
};

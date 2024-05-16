import axios from "axios";

const GITCOIN_API_KEY = process.env.GITCOIN_API_KEY ?? "";
const SCORER_ID = process.env.SCORER_ID ?? "";

export const passport = async (address: string) => {
  const data = await submitPassport(address);
  return data;
};

const submitPassport = async (address: string) => {
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
  };

  // get score data
  const { data } = await axios.post<{
    score: string;
    address: string;
    last_score_timestamp: string;
  }>(
    "https://api.scorer.gitcoin.co/registry/submit-passport",
    submitPassportData,
    submitPassportConfig,
  );

  const passportData = await getPassports(submitPassportConfig, address);

  return {
    ...data,
    ...passportData,
  }
};

const getPassports = async (submitPassportConfig: object, address: string) => {
  //get passport data
  const { data } = await axios.get<{
    next: string;
    prev: string;
    items: {
      version: string;
      credential: object;
      metadata: object;
    };
  }>(
    `https://api.scorer.gitcoin.co/registry/stamps/${address}?include_metadata=true`,
    submitPassportConfig,
  );

  return data;
};

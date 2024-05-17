import { ethers } from "ethers";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY ?? "";

export const getEnsForAddress = async (
  address: string,
): Promise<string | undefined | null> => {
  try {
    const provider = new ethers.providers.StaticJsonRpcProvider(
      `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      "mainnet",
    ) as ethers.providers.JsonRpcProvider;
    const name = await provider.lookupAddress(address);
    return name;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

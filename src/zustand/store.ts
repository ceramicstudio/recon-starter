import { create } from "zustand";
import { DIDSession } from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { type RuntimeCompositeDefinition } from "@composedb/types";
import { definition } from "@/__generated__/definition";
import { type GetWalletClientResult } from "@wagmi/core";
import { type DID } from "dids";

type Store = {
  endpoint: string;
  client: CeramicClient;
  compose: ComposeClient;
  setEndpoint: (newEndpoint: string) => void;
  setCompose: (
    wallet: GetWalletClientResult,
    newCompose: ComposeClient,
    newCeramic: CeramicClient,
  ) => void;
};

const StartAuth = async (
  walletClient: GetWalletClientResult,
  compose: ComposeClient,
  ceramic: CeramicClient,
) => {
  if (walletClient) {
    const accountId = (await getAccountId(
      walletClient,
      walletClient.account.address
    )) as unknown as string;

    const authMethod = await EthereumWebAuth.getAuthMethod(
      walletClient,
      // @ts-expect-error did-session
      accountId,
    );

    // @ts-expect-error did-session
    const session = await DIDSession.get(accountId, authMethod, {
      resources: compose.resources,
    });
    await ceramic.setDID(session.did as unknown as DID);
    compose.setDID(session.did as unknown as DID);
    localStorage.setItem("did", session.did.parent);
  }

  console.log("isAuth:", compose);
  return compose;
};

const useStore = create<Store>((set) => ({
  endpoint: "https://experiments.ceramic.dev",
  setEndpoint: (newEndpoint) =>
    set((_state) => ({
      endpoint: newEndpoint,
      client: new CeramicClient(newEndpoint),
      compose: new ComposeClient({
        ceramic: new CeramicClient(newEndpoint),
        definition: definition as RuntimeCompositeDefinition,
      }),
    })),
  setCompose: (wallet, newCompose, newCeramic) => {
    StartAuth(wallet, newCompose, newCeramic)
      .then((auth) => {
        set((_state) => ({
          compose: auth,
        }));
      })
      .catch((err) => {
        console.error(err);
      });
  },
  client: new CeramicClient("https://experiments.ceramic.dev"),
  compose: new ComposeClient({
    ceramic: new CeramicClient("https://experiments.ceramic.dev"),
    definition: definition as RuntimeCompositeDefinition,
  }),
}));

export default useStore;
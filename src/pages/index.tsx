import {
  type Extended,
  type Guilds,
  type Mission,
  type ObjectType,
  type PgMission,
} from "@/types";
import { signIn, useSession, signOut, getSession } from "next-auth/react";
import Navbar from "@/components/nav";
import Footer from "@/components/footer";
import Head from "next/head";
import { useAccount, useSignMessage } from "wagmi";
import { useEffect, useState } from "react";
// import {missions} from "@/missions/missions";

declare global {
  interface Window {
    ethereum?: Record<string, unknown> | undefined;
  }
}

export default function Home() {
  return (
    <>
      <Head>
        <title>The Amazing Race</title>
        <meta
          name="description"
          content="Complete missions. Collect points. Earn rewards."
        />
        <link rel="icon" href="/ceramic-favicon.svg" />
        <meta
          property="og:title"
          content="Complete missions. Collect points. Earn rewards."
        />
        <meta
          property="og:description"
          content="Complete missions. Collect points. Earn rewards."
        />
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-start bg-gradient-to-b from-[#0f0f0f] to-[#1e1e1e]">
        <Navbar />
        <AuthShowcase />
        <Footer />
      </div>
    </>
  );
}

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [loggedIn, setLoggedIn] = useState(false);
  const [guilds, setGuilds] = useState<Guilds[] | undefined>(undefined);
  const [missions, setMissions] = useState<Mission[] | undefined>(undefined);
  const [claim, setClaim] = useState<boolean>(false);
  const [access, setAccess] = useState<string>("");
  const [score, setScore] = useState<number | undefined>(undefined);
  const [passEligible, setPassEligible] = useState<boolean>(false);
  const [passportTotals, setPassportTotals] = useState<
    { contextTotal: number; total: number } | undefined
  >(undefined);
  const [ranking, setRanking] = useState<Extended | undefined>(undefined);
  const [aggData, setAggData] = useState<
    { aggregations: Extended[]; aggregationCount: number } | undefined
  >(undefined);
  const [totals, setTotals] = useState<
    { contextTotal: number; total: number } | undefined
  >(undefined);

  useEffect(() => {
    void getMissions();
    if (address) {
      void getRecords(100).then(() => {
        setLoggedIn(true);
      });
    }
    if(!address) {
      setLoggedIn(false);
      setRanking(undefined);
    }
  }, [loggedIn, address]);

  const fetchData = async () => {
    const session = await getSession();
    return session;
  };

  const getRecords = async (count: number) => {
    try {
      const response = await fetch("/api/pgLeaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count }),
      });
      const data = (await response.json()) as
        | {
            aggregations: Extended[];
            aggregationCount: number;
          }
        | undefined;
      if (data) {
        setAggData(data);
      }
      if (
        address &&
        data?.aggregations.find(
          (agg) =>
            agg.recipient.replace("did:pkh:eip155:1:", "") ===
            address.toLowerCase(),
        )
      ) {
        setRanking(
          data?.aggregations.find(
            (agg) =>
              agg.recipient.replace("did:pkh:eip155:1:", "") ===
              address.toLowerCase(),
          ),
        );
      }
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const getMissions = async () => {
    try {
      const response = await fetch("/api/missions", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = (await response.json()) as
        | PgMission[]
        | undefined
        | { error: string };
      let missionsToSet: Mission[] = [];
      if (data && !("error" in data)) {
        missionsToSet = data
          .map((mission) => {
            return {
              id: mission.id,
              name: mission.name,
              description: mission.description,
              points: mission.points,
              tags: [mission.difficulty, mission.duration, mission.persona]
                .join(",")
                .split(","),
              startdate: mission.startdate,
              active: mission.active,
              featured: mission.featured,
            };
          })
          //then sort by startDate
          .sort((a, b) => {
            return (
              new Date(a.startdate).getTime() - new Date(b.startdate).getTime()
            );
          });
        // then filter by active
        missionsToSet = missionsToSet
          .filter((mission) => mission.active)
          // since this is the homepage, we only show featured missions
          .filter((mission) => mission.featured);
        setMissions(missionsToSet);
      }
      console.log(missionsToSet);
    } catch (error) {
      console.error(error);
    }
  };

  const getMessageResponse = async (): Promise<{
    message: string;
    nonce: string;
  }> => {
    try {
      const response = await fetch("/api/getSignature", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = (await response.json()) as
        | { message: string; nonce: string }
        | { error: string };
      console.log(data);
      if ("error" in data) {
        throw new Error(data.error);
      }
      return data;
    } catch (error) {
      console.error(error);
      throw new Error(String(error));
    }
  };

  const submitPassport = async () => {
    try {
      // call the API to get the signing message and the nonce
      const { message, nonce } = await getMessageResponse();
      // sign the message
      const signature = await signMessageAsync({ message });

      // submit the passport
      const response = await fetch("/api/submitPassport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, signature, nonce }),
      });
      const data = (await response.json()) as {
        score: string;
        address: string;
        last_score_timestamp: string;
      };
      setScore(Number(data.score));
    } catch (err) {
      console.log("error: ", err);
    }
  };

  const awardPoints = async (
    context: string,
    recipient: string,
    amount: number,
  ) => {
    try {
      const response = await fetch("/api/createPoints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipient, context, amount }),
      });
      const data = (await response.json()) as {
        contextTotal: number;
        total: number;
      };
      console.log(data);
      context === "discord" ? setTotals(data) : setPassportTotals(data);
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  const getGuilds = async (
    accessToken: string,
  ): Promise<Guilds[] | undefined> => {
    const guilds = await fetch("/api/servers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: accessToken }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        return data as Guilds[] | undefined;
      });
    console.log(guilds);
    return guilds;
  };

  useEffect(() => {
    fetchData()
      .then((data) => {
        if (data) {
          console.log(data);
          setAccess(data.accessToken);
        }
      })
      .catch((error) => {
        console.error(error);
      })
      .then(() => {
        void getRecords(100);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
      <>
        <h1 className="text-center text-6xl font-extrabold tracking-tight text-white">
          The <span className="text-[hsl(280,100%,70%)]">Amazing</span> Race
        </h1>
        <h2 className="text-center text-2xl text-white">
          Complete missions. Collect points. Earn rewards.{" "}
        </h2>
        <div className="grid grid-cols-3 gap-4 p-4">
          {missions?.length &&
            missions?.map((mission) => (
              <div
                className="w-90 relative m-4 h-80 rounded-lg bg-gray-400"
                key={mission.id}
              >
                <div className="text-center text-white">
                  <h3 className="text-1xl mt-4 font-bold text-black">
                    {mission.name}
                  </h3>
                  <p className="text-md p-3 text-black">
                    {mission.description}
                  </p>
                  <div className="grid grid-cols-3 gap-4 p-4">
                    {mission.tags?.map((tag) => (
                      <div
                        className="rounded-lg bg-[#0f0f0f] bg-opacity-80 p-2 text-sm text-white"
                        key={tag}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-0 flex h-10 w-full items-center justify-center bg-[#0f0f0f] bg-opacity-30">
                    <p className="text-md p-3 text-black">{mission.points}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="flex w-full flex-col justify-center gap-4 p-4">
          <h2 className="m-4 text-left text-4xl text-white">Leaderboard</h2>
          <p className="m-4 text-left text-2xl text-white">
            Compete with others to earn your spot at the top.
          </p>

          <div className="flex w-full flex-col rounded-lg border-2 border-white p-4">
            <div className="flex w-full flex-row justify-between p-4">
              <div className="flex w-1/2 flex-col">
                <h3 className="text-left text-2xl text-white">Your Ranking</h3>
                {!loggedIn && (
                  <p className="mt-4  text-left text-white">
                    Connect your wallet to see your points and ranking.
                  </p>
                )}
                {((loggedIn && address && aggData && !ranking) ?? !address) && (
                  <p className="mt-4  text-left text-white">
                    You are not currently ranked. Complete missions to earn
                    eligible points.
                  </p>
                )}
                {loggedIn && aggData && ranking && (
                  <p className="mt-4  text-left text-white">
                    You&apos;ve earned {ranking.points ? ranking.points : "0"}{" "}
                    points and are currently ranked{" "}
                    {aggData.aggregations.indexOf(ranking) + 1} out of{" "}
                    {aggData.aggregationCount} participants.
                  </p>
                )}
              </div>

              <div className="flex w-1/2 flex-col items-end justify-center">
                <w3m-button size="md" balance="hide" />
              </div>
            </div>
            {ranking && aggData && (
              <div className="grid grid-cols-6 gap-4 rounded-lg  p-4">
                <div className="flex w-full flex-col justify-between p-4">
                  <p className="mb-4 text-center text-white">Account (DID)</p>

                  <p className="text-center text-white">
                    {ranking.recipient.slice(0, 7) +
                      "..." +
                      ranking.recipient.slice(-10)}
                  </p>
                </div>
                <div className="flex w-full flex-col justify-between p-4">
                  <p className="mb-4 text-center text-white">Wallet Address</p>

                  <p className="text-center text-white">{ranking.ens}</p>
                </div>
                <div className="flex w-full flex-col justify-between p-4">
                  <p className="mb-4 text-center text-white">Rank</p>

                  <p className="text-center text-white">
                    {aggData.aggregations.indexOf(ranking) + 1}
                  </p>
                </div>
                <div className="flex w-full flex-col justify-between p-4">
                  <p className="mb-4 text-center text-white">Points</p>

                  <p className="text-center text-white">{ranking.points}</p>
                </div>
                <div className="flex w-full flex-col justify-between p-4">
                  <p className="mb-4 text-center text-white">Last Active</p>

                  <p className="text-center text-white">
                    {new Date(ranking.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex w-full flex-col justify-between p-4">
                  <p className="mb-4 text-center text-white">Verification</p>
                  <p className="text-center text-white">
                    {ranking.verified ? "Verified" : "Unverified"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {aggData && (
            <>
              <div className="grid grid-cols-6 gap-4 rounded-lg border-2 border-white p-4">
                <div className="flex w-full flex-col justify-between p-4">
                  <p className="mb-4 text-center text-white">Account (DID)</p>
                  {aggData.aggregations.map((agg) => (
                    <p key={agg.recipient} className="text-center text-white">
                      {agg.recipient.slice(0, 7) +
                        "..." +
                        agg.recipient.slice(-10)}
                    </p>
                  ))}
                </div>
                <div className="flex w-full flex-col justify-between p-4">
                  <p className="mb-4 text-center text-white">Wallet Address</p>
                  {aggData.aggregations.map((agg) => {
                    if (agg.ens) {
                      return (
                        <p
                          key={agg.recipient}
                          className="text-center text-white"
                        >
                          {agg.ens}
                        </p>
                      );
                    } else {
                      return (
                        <p
                          key={agg.recipient}
                          className="text-center text-white"
                        >
                          {agg.recipient
                            .replace("did:pkh:eip155:1:", "")
                            .slice(0, 7) +
                            "..." +
                            agg.recipient
                              .replace("did:pkh:eip155:1:", "")
                              .slice(-10)}
                        </p>
                      );
                    }
                  })}
                </div>
                <div className="flex w-full flex-col justify-between p-4">
                  <p className="mb-4 text-center text-white">Rank</p>
                  {aggData.aggregations.map((agg) => (
                    <p key={agg.recipient} className="text-center text-white">
                      {aggData.aggregations.indexOf(agg) + 1}
                    </p>
                  ))}
                </div>
                <div className="flex w-full flex-col justify-between p-4">
                  <p className="mb-4 text-center text-white">Points</p>
                  {aggData.aggregations.map((agg) => (
                    <p key={agg.recipient} className="text-center text-white">
                      {agg.points}
                    </p>
                  ))}
                </div>
                <div className="flex w-full flex-col justify-between p-4">
                  <p className="mb-4 text-center text-white">Last Active</p>
                  {aggData.aggregations.map((agg) => (
                    <p key={agg.recipient} className="text-center text-white">
                      {new Date(agg.date).toLocaleDateString()}
                    </p>
                  ))}
                </div>
                <div className="flex w-full flex-col justify-between p-4">
                  <p className="mb-4 text-center text-white">Verification</p>
                  {aggData.aggregations.map((agg) => (
                    <p key={agg.recipient} className="text-center text-white">
                      {agg.verified ? "Verified" : "Unverified"}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex w-full flex-row">
                <p className="ml-4 text-left text-white">
                  {aggData.aggregationCount} Participants
                </p>
                <button
                  className="ml-auto mr-4 text-right text-white"
                  onClick={() => void console.log("Replace with action")}
                >
                  First
                </button>
                <button
                  className="mr-4 text-right text-white"
                  onClick={() => void console.log("Replace with action")}
                >
                  Prev
                </button>
                <button
                  className="mr-4 text-right text-white"
                  onClick={() => void console.log("Replace with action")}
                >
                  Next
                </button>
                <p className="mr-4 text-right text-white">1</p>
                <button
                  className="mr-4 text-right text-white"
                  onClick={() => void console.log("Replace with action")}
                >
                  Last
                </button>
              </div>
            </>
          )}
        </div>
      </>
    </div>
  );
};

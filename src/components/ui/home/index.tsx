import { useAccount, useSignMessage } from "wagmi";
import { useEffect, useState } from "react";
import { signIn, useSession, signOut, getSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  type Extended,
  type Guilds,
  type Mission,
  type ObjectType,
  type PgMission,
} from "@/types";
import { RotatingLines } from "react-loader-spinner";

const HomeShowcase: React.FC = () => {
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
    if (!address) {
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
    <>
      <section className="border-border from-background via-background relative border-b bg-gradient-to-b via-90% to-transparent">
        <div className="container mx-auto text-center">
          <div className="my-24 py-14">
            <h5 className="text-primary">FEATURED MISSIONS</h5>
            {/* <h2 className="my-4 text-4xl font-extrabold">
            Build better websites with us
          </h2> */}

            {/* <p className="text-muted-foreground mx-auto my-4 w-full max-w-md bg-transparent text-center text-sm font-medium leading-relaxed tracking-wide">
            Show off your features or services in a beautiful way. This section
            is perfect for showcasing
          </p> */}

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {missions?.length &&
                missions?.map((mission) => (
                  <Card key={mission.id} className="mx-auto max-w-lg">
                    <CardHeader>
                      {/* <div className="text-primary-foreground border-border bg-primary mx-auto flex h-16 w-16 items-center justify-center rounded-xl border">
                    {feature.icon}
                  </div> */}
                    </CardHeader>
                    <CardContent>
                      <CardTitle>{mission.name}</CardTitle>
                      <CardDescription className="mt-4">
                        {mission.description}
                      </CardDescription>
                      <div className="mt-4 flex justify-between">
                        {mission.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-primary-foreground text-primary rounded-full px-2 py-1 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
            {!missions && (
              <div className="flex items-center justify-center">
                <RotatingLines />
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-0 -z-10 h-full max-h-full w-full blur-2xl">
          <div className="animate-blob absolute bottom-0 left-0 h-56 w-1/2 rounded-full bg-violet-600 opacity-70 mix-blend-multiply blur-3xl filter"></div>
          <div className="animate-blob absolute bottom-0 right-0 h-56 w-1/2 rounded-full bg-sky-600 opacity-70 mix-blend-multiply blur-3xl filter delay-1000"></div>
        </div>
      </section>
      <section className="border-border bg-background dark border-b">
        <div className="container mx-auto text-center">
          <div className="py-14">
            <h2 className="text-foreground my-4 text-4xl font-extrabold">
              Leaderboard
            </h2>

            <p className="text-muted-foreground text-md mx-auto my-4 w-full max-w-md bg-transparent text-center font-medium leading-relaxed tracking-wide">
              Compete with others to earn your spot at the top.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <Card
                key={"Your Ranking"}
                className="relative mx-auto w-full text-left"
              >
                <CardHeader>
                  <CardTitle className="text-center text-2xl">
                    Your Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid-cols-1 gap-4 p-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                    <div className="flex w-full flex-col">
                      {!loggedIn && (
                        <div className="flex w-full items-center justify-between sm:flex-col md:flex-col lg:flex-row">
                          <p className="mt-4  text-left text-white">
                            Connect your wallet to see your points and ranking.
                          </p>
                          <div className="align-right mt-4">
                            <w3m-button size="sm" balance="hide" />
                          </div>
                        </div>
                      )}
                      {((loggedIn && address && aggData && !ranking) ??
                        !address) && (
                        <p className="mt-4  text-left text-white">
                          You are not currently ranked. Complete missions to
                          earn eligible points.
                        </p>
                      )}
                      {loggedIn && aggData && ranking && (
                        <p className="mt-4  text-left text-white">
                          You&apos;ve earned{" "}
                          {ranking.points ? ranking.points : "0"} points and are
                          currently ranked{" "}
                          {aggData.aggregations.indexOf(ranking) + 1} out of{" "}
                          {aggData.aggregationCount} participants.
                        </p>
                      )}
                    </div>
                    {/* {!loggedIn  && (
                      <div className="flex w-1/3 flex-col items-end justify-center">
                        <w3m-button size="md" balance="hide" />
                      </div>
                    )} */}
                  </div>
                  {ranking && aggData && (
                    <div className="grid gap-4 rounded-lg  p-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-6">
                      <div className="flex w-full flex-col justify-between p-4">
                        <p className="mb-4 text-center font-bold text-white">
                          Account (DID)
                        </p>

                        <p className="text-center text-white">
                          {ranking.recipient.slice(0, 7) +
                            "..." +
                            ranking.recipient.slice(-6)}
                        </p>
                      </div>
                      <div className="flex w-full flex-col justify-between p-4">
                        <p className="mb-4 text-center font-bold text-white">
                          Wallet Address
                        </p>
                        <p className="text-center text-white">
                          {ranking.ens ? (
                            ranking.ens
                          ) : (
                            <p
                              key={ranking.recipient}
                              className="text-center text-white"
                            >
                              {ranking.recipient
                                .replace("did:pkh:eip155:1:", "")
                                .slice(0, 7) +
                                "..." +
                                ranking.recipient
                                  .replace("did:pkh:eip155:1:", "")
                                  .slice(-6)}
                            </p>
                          )}
                        </p>
                      </div>
                      <div className="flex w-full flex-col justify-between p-4">
                        <p className="mb-4 text-center font-bold text-white">
                          Rank
                        </p>

                        <p className="text-center text-white">
                          {aggData.aggregations.indexOf(ranking) + 1}
                        </p>
                      </div>
                      <div className="flex w-full flex-col justify-between p-4">
                        <p className="mb-4 text-center font-bold text-white">
                          Points
                        </p>

                        <p className="text-center text-white">
                          {ranking.points}
                        </p>
                      </div>
                      <div className="flex w-full flex-col justify-between p-4">
                        <p className="mb-4 text-center font-bold text-white">
                          Last Active
                        </p>

                        <p className="text-center text-white">
                          {new Date(ranking.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex w-full flex-col justify-between p-4">
                        <p className="mb-4 text-center font-bold text-white">
                          Verification
                        </p>
                        <p className="text-center text-white">
                          {ranking.verified ? "Verified" : "Unverified"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card
                key={"Leaderboard"}
                className="relative mx-auto w-full text-left"
              >
                <CardHeader>
                  <CardTitle className="text-center text-2xl">
                    Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aggData && (
                    <div className="grid gap-4 rounded-lg  p-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-6">
                      <div className="flex w-full flex-col justify-between p-4">
                        <p className="mb-4 text-center font-bold text-white">
                          Account (DID)
                        </p>
                        {aggData.aggregations.map((agg) => (
                          <p
                            key={agg.recipient}
                            className="text-center text-white"
                          >
                            {agg.recipient.slice(0, 7) +
                              "..." +
                              agg.recipient.slice(-6)}
                          </p>
                        ))}
                      </div>
                      <div className="flex w-full flex-col justify-between p-4">
                        <p className="mb-4 text-center font-bold text-white">
                          Wallet Address
                        </p>
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
                        <p className="mb-4 text-center font-bold text-white">
                          Rank
                        </p>
                        {aggData.aggregations.map((agg) => (
                          <p
                            key={agg.recipient}
                            className="text-center text-white"
                          >
                            {aggData.aggregations.indexOf(agg) + 1}
                          </p>
                        ))}
                      </div>
                      <div className="flex w-full flex-col justify-between p-4">
                        <p className="mb-4 text-center font-bold text-white">
                          Points
                        </p>
                        {aggData.aggregations.map((agg) => (
                          <p
                            key={agg.recipient}
                            className="text-center text-white"
                          >
                            {agg.points}
                          </p>
                        ))}
                      </div>
                      <div className="flex w-full flex-col justify-between p-4">
                        <p className="mb-4 text-center font-bold text-white">
                          Last Active
                        </p>
                        {aggData.aggregations.map((agg) => (
                          <p
                            key={agg.recipient}
                            className="text-center text-white"
                          >
                            {new Date(agg.date).toLocaleDateString()}
                          </p>
                        ))}
                      </div>
                      <div className="flex w-full flex-col justify-between p-4">
                        <p className="mb-4 text-center font-bold text-white">
                          Verification
                        </p>
                        {aggData.aggregations.map((agg) => (
                          <p
                            key={agg.recipient}
                            className="text-center text-white"
                          >
                            {agg.verified ? "Verified" : "Unverified"}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeShowcase;

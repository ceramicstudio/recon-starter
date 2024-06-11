import { useWalletClient } from "wagmi";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { definition } from "../__generated__/definition.js";
import { type RuntimeCompositeDefinition } from "@composedb/types";
import TextareaAutosize from "react-textarea-autosize";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import useStore from "@/zustand/store";
import Head from "next/head";
import HomeShowcase from "@/components/ui/home";

declare global {
  interface Window {
    ethereum?: Record<string, unknown> | undefined;
  }
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const { address } = useAccount();
  const { endpoint, setEndpoint, compose, setCompose, client } = useStore();
  const { data: walletClient } = useWalletClient();
  useEffect(() => {
    if (address) {
      setLoggedIn(true);
      if (walletClient && loggedIn) {
        setCompose(walletClient, compose, client);
      }
    }
  }, [address, walletClient, compose, client, loggedIn, setCompose]);

  return (
    <div className="min-h-screen">
      <Head>
        <title>Create Trust Credentials</title>
        <meta name="description" content="" />
        <link rel="icon" href="/ceramic-favicon.svg" />
        <meta property="og:title" content="" />
        <meta property="og:description" content="" />
      </Head>
      <div className="border-border ">
        <main className="container mx-auto">
          <div className="relative mx-auto w-full max-w-4xl pt-4 text-center md:mt-24">
            <div className="hidden justify-center md:flex">
              <div className="flex flex-row items-center justify-center gap-5 rounded-md border border-border bg-card/60 p-1 text-xs backdrop-blur-lg"></div>
            </div>
            <h1 className="my-4 text-4xl font-extrabold md:text-7xl md:leading-tight">
              Create Trust Credentials
            </h1>
            <p className="text-md mx-auto my-4 w-full max-w-xl text-center font-medium leading-relaxed tracking-wide">
              Create trust credentials for your relationships and interactions.
            </p>
            <p className="text-sm mx-auto w-full max-w-xl text-center italic leading-relaxed tracking-wide">
              Current Ceramic Endpoint:
            </p>
            <div className="my-8 flex flex-row items-center justify-center space-x-4">
              <TextareaAutosize
                className="mb-4 h-full w-1/2 resize-none rounded-md border border-gray-300 p-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Scope (e.g. 'Software Development') - REQUIRED"
                value={endpoint}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setEndpoint(e.target.value);
                }}
                onBlur={() => {
                  if (walletClient) {
                    const client = new CeramicClient(endpoint);
                    const composeDB = new ComposeClient({
                      ceramic: client,
                      definition: definition as RuntimeCompositeDefinition,
                    });
                    setCompose(walletClient, composeDB, client);
                  }
                }}
              />
            </div>

            <div className="absolute top-0 -z-10 h-full max-h-full w-full max-w-screen-lg blur-2xl">
              <div className="absolute left-24 top-24 h-56 w-56 animate-blob rounded-full bg-violet-600 opacity-70 mix-blend-multiply blur-3xl filter"></div>
              <div className="absolute bottom-2 right-1/4 hidden h-56 w-56 animate-blob rounded-full bg-sky-600 opacity-70 mix-blend-multiply blur-3xl filter delay-1000 md:block"></div>
              <div className="absolute bottom-1/4 left-1/3 hidden h-56 w-56 animate-blob rounded-full bg-pink-600 opacity-70 mix-blend-multiply blur-3xl filter delay-500 md:block"></div>
            </div>
          </div>
        </main>
      </div>

      <HomeShowcase />

      {/* Pricing */}

      {/* <section className="border-border bg-background dark border-b">
        <div className="container mx-auto text-center">
          <div className="py-14">
            <h2 className="text-foreground my-4 text-4xl font-extrabold">
              Pricing Plans
            </h2>

            <p className="text-muted-foreground mx-auto my-4 w-full max-w-md bg-transparent text-center text-sm font-medium leading-relaxed tracking-wide">
              Choose a plan that works best for you. You can always upgrade or
              downgrade your plan later.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {pricing.map((plan) => (
                <Card
                  key={plan.title}
                  className="relative mx-auto w-full max-w-xl text-left"
                >
                  {plan.fancy && (
                    <Badge className="absolute right-4 top-4">Popular</Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.title}</CardTitle>
                    <CardDescription className="mt-4">
                      {plan.description}
                    </CardDescription>
                    <h5 className="text-2xl font-bold">{plan.price}</h5>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      variant={plan.fancy ? "default" : "secondary"}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                  <CardFooter>
                    <ul className="mt-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CircleCheck className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
}

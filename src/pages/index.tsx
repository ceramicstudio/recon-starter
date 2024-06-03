import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { features } from "@/data/features";
import { pricing } from "@/data/pricing";
import { CircleCheck } from "lucide-react";
import Head from "next/head";
import HomeShowcase from "@/components/ui/home";

declare global {
  interface Window {
    ethereum?: Record<string, unknown> | undefined;
  }
}

export default function Home() {
  return (
    <div className="min-h-screen">
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
      <div className="border-border ">
        <main className="container mx-auto">
          <div className="relative mx-auto w-full max-w-4xl pt-4 text-center md:mt-24">
            <div className="hidden justify-center md:flex">
              <div className="bg-card/60 border-border flex flex-row items-center justify-center gap-5 rounded-md border p-1 text-xs backdrop-blur-lg">
                <Badge className="font-semibold">New</Badge>
                <h5>Announce your new feature here</h5>
                <Link href="/" className="flex flex-row items-center">
                  View all features
                  <ArrowRightIcon className="ml-2 h-6 w-6" />
                </Link>
              </div>
            </div>
            <h1 className="my-4 text-4xl font-extrabold md:text-7xl md:leading-tight">
              The Amazing Race
            </h1>
            <p className="mx-auto my-4 w-full max-w-xl text-center text-md font-medium leading-relaxed tracking-wide">
            Complete missions. Collect points. Earn rewards.
            </p>
            <div className="my-8 flex flex-row items-center justify-center space-x-4">
              <Button>Get Started</Button>
              <Button variant="secondary">Learn More</Button>
            </div>

            <div className="absolute top-0 -z-10 h-full max-h-full w-full max-w-screen-lg blur-2xl">
              <div className="animate-blob absolute left-24 top-24 h-56 w-56 rounded-full bg-violet-600 opacity-70 mix-blend-multiply blur-3xl filter"></div>
              <div className="animate-blob absolute bottom-2 right-1/4 hidden h-56 w-56 rounded-full bg-sky-600 opacity-70 mix-blend-multiply blur-3xl filter delay-1000 md:block"></div>
              <div className="animate-blob absolute bottom-1/4 left-1/3 hidden h-56 w-56 rounded-full bg-pink-600 opacity-70 mix-blend-multiply blur-3xl filter delay-500 md:block"></div>
            </div>
          </div>
        </main>
      </div>

      {/* features */}

      <HomeShowcase />

      {/* Pricing */}

      <section className="border-border bg-background dark border-b">
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
      </section>
    </div>
  );
}

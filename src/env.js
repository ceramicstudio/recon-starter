import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    CERAMIC_PRIVATE_KEY: z.string(),
    AGGREGATION_ID: z.string(),
    ALLOCATION_ID: z.string(),
    VERIFIED_TOTAL_ID: z.string(),
    SHEET_ID: z.string().optional(),
    GITCOIN_API_KEY: z.string(),
    SCORER_ID: z.string(),
    DATABASE_URL: z.string(),
    CERAMIC_API: z.string().url(),
    DEFORM_API_KEY: z.string(),
    DEFORM_ID: z.string(),
    DEFORM_FORM_ID: z.string(),
    DEFORM_VIRAL_FORM_ID: z.string(),
    ANSWERS: z.string(),
    ALCHEMY_API_KEY: z.string(),
    NOTION_SECRET: z.string(),
    NOTION_DATABASE_ID: z.string(),
    X_BEARER_TOKEN: z.string(),
    NOTION_VIRAL_DATABASE_ID: z.string(),
    //optional
    DISCORD_CLIENT_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional(),
    TYPE: z.string().optional(),
    PROJECT_ID: z.string().optional(),
    PRIVATE_KEY_ID: z.string().optional(),
    PRIVATE_KEY: z.string().optional(),
    CLIENT_EMAIL: z.string().optional(),
    CLIENT_ID: z.string().optional(),
    UNIVERSE_DOMAIN: z.string().optional(),
    PROD_URL: z.string().url().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_PROJECT_ID: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    CERAMIC_PRIVATE_KEY: process.env.CERAMIC_PRIVATE_KEY,
    AGGREGATION_ID: process.env.AGGREGATION_ID,
    ALLOCATION_ID: process.env.ALLOCATION_ID,
    VERIFIED_TOTAL_ID: process.env.VERIFIED_TOTAL_ID,
    SHEET_ID: process.env.SHEET_ID,
    TYPE: process.env.TYPE,
    PROJECT_ID: process.env.PROJECT_ID,
    PRIVATE_KEY_ID: process.env.PRIVATE_KEY_ID,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    CLIENT_EMAIL: process.env.CLIENT_EMAIL,
    CLIENT_ID: process.env.CLIENT_ID,
    UNIVERSE_DOMAIN: process.env.UNIVERSE_DOMAIN,
    GITCOIN_API_KEY: process.env.GITCOIN_API_KEY,
    SCORER_ID: process.env.SCORER_ID,
    CERAMIC_API: process.env.CERAMIC_API,
    PROD_URL: process.env.PROD_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    DEFORM_API_KEY: process.env.DEFORM_API_KEY,
    DEFORM_ID: process.env.DEFORM_ID,
    DEFORM_FORM_ID: process.env.DEFORM_FORM_ID,
    ANSWERS: process.env.ANSWERS,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    NOTION_SECRET: process.env.NOTION_SECRET,
    NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
    NEXT_PUBLIC_PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
    X_BEARER_TOKEN: process.env.X_BEARER_TOKEN,
    NOTION_VIRAL_DATABASE_ID: process.env.NOTION_VIRAL_DATABASE_ID,
    DEFORM_VIRAL_FORM_ID: process.env.DEFORM_VIRAL_FORM_ID,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

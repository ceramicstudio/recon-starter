import { Client } from "twitter-api-sdk";
import { type XLikesResponse, type XTweetResponse } from "@/types";

const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN ?? "";

export const getTweet = async (
  tweet: string,
): Promise<
  | {
      tweetData: XTweetResponse;
      likes: XLikesResponse;
    }
  | undefined
> => {
  try {
    const client = new Client(X_BEARER_TOKEN);

    const splitTweet = tweet.split("/");
    console.log(splitTweet);

    const tweetId = splitTweet[splitTweet.length - 1];
    const account = splitTweet[splitTweet.length - 3];

    if (!tweetId || !account) {
      return undefined;
    }
    const tweetData = (await client.tweets.findTweetById(tweetId)) as
      | XTweetResponse
      | undefined;

    const likes = (await client.users.tweetsIdLikingUsers(tweetId)) as
      | XLikesResponse
      | undefined;

    if (!tweetData || !likes) {
      return undefined;
    }
    return {
      tweetData,
      likes,
    };
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

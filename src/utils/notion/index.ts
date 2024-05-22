import { type ObjectType, type NotionViralType } from "@/types";

const NOTION_SECRET = process.env.NOTION_SECRET ?? "";

export const getNotion = async (
  NOTION_DATABASE_ID: string,
  campaign: string,
): Promise<ObjectType[] | NotionViralType[] | undefined> => {
  try {
    const headers = new Headers({
      Authorization: "Bearer " + NOTION_SECRET,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    });

    const response = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
      {
        method: "POST", // or POST, PUT, DELETE, etc.
        headers: headers,
      },
    );

    const entries: ObjectType[] = [];
    const viralEntries: NotionViralType[] = [];

    if (campaign === "Onboarding") {
      await response.json().then(
        (data: {
          results?:
            | {
                properties: ObjectType;
              }[]
            | undefined;
        }) => {
          if (data?.results) {
            data.results.forEach((entry) => {
              const properties = entry.properties;
              entries.push(properties);
            });
          }
        },
      );
      return entries;
    } else if (campaign === "Viral") {
      await response.json().then(
        (data: {
          results?:
            | {
                properties: NotionViralType;
              }[]
            | undefined;
        }) => {
          if (data?.results) {
            data.results.forEach((entry) => {
              const properties = entry.properties;
              viralEntries.push(properties);
            });
          }
        },
      );
      return viralEntries;
    }

    return undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

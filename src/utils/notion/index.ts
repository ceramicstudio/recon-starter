import { type ObjectType } from "@/types";

const NOTION_SECRET = process.env.NOTION_SECRET ?? "";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID ?? "";

export const getNotion = async (): Promise<ObjectType[] | undefined> => {
  try {
    const headers = new Headers({
      Authorization: "Bearer " + NOTION_SECRET,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    });

    // const response = await fetch(
    //   `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}`,
    //   {
    //     method: "GET", // or POST, PUT, DELETE, etc.
    //     headers: headers,
    //   },
    // );

    const response = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`,
      {
        method: "POST", // or POST, PUT, DELETE, etc.
        headers: headers,
      },
    );

    const entries: ObjectType[] = [];

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

    // sort entries by entry.Order.number
    entries.sort((a, b) => {
      const orderA = a.Order.number ?? 0;
      const orderB = b.Order.number ?? 0;
      return orderA - orderB;
    });
    return entries;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

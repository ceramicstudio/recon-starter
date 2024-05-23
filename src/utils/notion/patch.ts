import { type NotionViralType, type NotionViralEntry } from "@/types";

const NOTION_SECRET = process.env.NOTION_SECRET ?? "";

export const patchNotion = async (
  NOTION_DATABASE_ID: string,
  campaign: string,
  data: NotionViralEntry,
): Promise<NotionViralType | undefined> => {
  try {
    const headers = new Headers({
      Authorization: "Bearer " + NOTION_SECRET,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    });

    const response = await fetch(`https://api.notion.com/v1/pages`, {
      method: "POST", // or POST, PUT, DELETE, etc.
      headers: headers,
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: data,
      }),
    });

    const entries = (await response.json()) as NotionViralType;
    return entries;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

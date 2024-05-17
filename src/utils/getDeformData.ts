import { type DeformResponse } from "@/types";

const DEFORM_API_KEY = process.env.DEFORM_API_KEY ?? "";
const DEFORM_ID = process.env.DEFORM_ID ?? "";
const DEFORM_FORM_ID = process.env.DEFORM_FORM_ID ?? "";

export const getDeform = async (): Promise<DeformResponse | undefined> => {
  try {
    const base64Credentials = btoa(DEFORM_ID + ":" + DEFORM_API_KEY);
    const headers = new Headers({
      Authorization: "Basic " + base64Credentials,
      "Content-Type": "application/json",
    });

    const response = await fetch(
      `https://api.deform.cc/v1/forms/${DEFORM_FORM_ID}/responses`,
      {
        method: "GET", // or POST, PUT, DELETE, etc.
        headers: headers,
      },
    );
    const results = (await response.json()) as DeformResponse;
    return results;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};

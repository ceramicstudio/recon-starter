import { spreadsheetId, googleSheetsInstance } from "@/utils/googleContext";

export const getSheetData = async () => {
  try {
    const result = await googleSheetsInstance.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1",
    });
    const rows = result.data.values;
    return rows;
  } catch (error) {
    console.error(error);
    return { error: "Internal Server Error" };
  }
};

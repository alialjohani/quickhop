import { NavigateFunction } from "react-router-dom";

export const truncateString = (str: string, maxLength: number): string => {
  if (str.length > maxLength) {
    const truncated = str.slice(0, maxLength).trimEnd();
    return truncated.slice(0, truncated.lastIndexOf(" ")) + "...";
  }
  return str;
};

export const cleanText = (input: string): string => {
  if (input !== null && input !== undefined && input !== "") {
    return input
      .split("\n") // Split the text into lines
      .map((line) => line.trim()) // Trim spaces from each line
      .filter((line) => line !== "") // Remove empty lines
      .join("\n"); // Join the lines back together
  }
  return input;
};

export const isValidStatus = <T extends Record<string, any>>(
  status: string,
  statusObject: T,
): status is Extract<keyof T, string> => {
  return status in statusObject;
};

export const checkIdInUrl = (
  id: string | undefined,
  navigate: NavigateFunction,
) => {
  const numericId = Number(id);
  if (!id || isNaN(numericId)) {
    navigate("/NotFound");
  }
};

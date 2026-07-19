import { randomUUID } from "crypto";

export const generateUniqueId = (title: string): string => {
  return `${title}_${randomUUID()}`;
};
import { RESERVED_HANDLES } from "@/core/constants/limits";

const HANDLE_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

export function normalizeHandle(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 30);
}

export function isValidHandle(handle: string): boolean {
  if (!HANDLE_REGEX.test(handle)) return false;
  if (RESERVED_HANDLES.has(handle)) return false;
  return true;
}
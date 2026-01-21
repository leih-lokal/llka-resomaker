import { ApiError } from "@/lib/types/reservation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export class ApiClientError extends Error {
  code: number;
  data?: ApiError["data"];

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.data = error.data;
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new ApiClientError(error);
  }

  return response.json();
}

export function getImageUrl(itemId: string, filename: string): string {
  return `${API_BASE}/api/files/item/${itemId}/${filename}`;
}

export function getThumbnailUrl(
  itemId: string,
  filename: string,
  size: string = "100x100"
): string {
  return `${API_BASE}/api/files/item/${itemId}/${filename}?thumb=${size}`;
}

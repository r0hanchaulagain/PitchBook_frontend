// DRY helpers for POST/PUT/DELETE API calls with cookies

import axios from "axios";

const axiosInstance = axios.create({
  withCredentials: true,
});

export type ApiMethod = "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method: ApiMethod;
  endpoint: string; // path after /api/v1
  body?: any;
  headers?: Record<string, string>;
}

// Helper to refresh access token
async function refreshAccessToken() {
  try {
    console.debug("[refreshAccessToken] Attempting refresh...");
    await apiMutation({ method: "POST", endpoint: "users/refresh-token" });
    console.debug("[refreshAccessToken] Refresh succeeded.");
  } catch (err) {
    console.error("[refreshAccessToken] Refresh failed:", err);
    throw new Error("Session expired. Please log in again.");
  }
}

// DRY helper for GET API calls with cookies
export async function apiQuery<T>(
  endpoint: string,
  headers: Record<string, string> = {},
): Promise<T> {
  try {
    return await internalApiQuery<T>(endpoint, headers);
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      console.debug(
        `[apiQuery] 401 detected for ${endpoint}. Attempting refresh token...`,
      );
      try {
        await refreshAccessToken();
        console.debug(
          `[apiQuery] Refresh token succeeded. Retrying ${endpoint}...`,
        );
        return await internalApiQuery<T>(endpoint, headers);
      } catch (refreshErr) {
        console.error(`[apiQuery] Refresh token failed:`, refreshErr);
        throw new Error("Session expired. Please log in again.");
      }
    }

    let errorMessage = "An unexpected error occurred";

    // Try to extract error message from different response formats
    if (err.response?.data) {
      const { data } = err.response;

      // Handle different error response formats
      if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data);
          errorMessage =
            parsed.message || parsed.error || JSON.stringify(parsed);
        } catch {
          errorMessage = data;
        }
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage =
          typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error);
      } else {
        errorMessage = JSON.stringify(data);
      }
    } else if (err.message) {
      errorMessage = err.message;
    }

    // Clean up the error message
    errorMessage = errorMessage.replace(/^Error: /, "").trim();

    // Create new error with the extracted message
    const error = new Error(errorMessage);
    // Preserve the original error stack
    error.stack = err.stack;
    // Attach the original error for debugging
    (error as any).originalError = err;

    throw error;
  }
}

export async function apiMutation<T = any>({
  method,
  endpoint,
  body,
  headers = {},
}: ApiRequestOptions): Promise<T> {
  try {
    return await internalApiMutation<T>({ method, endpoint, body, headers });
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      console.debug(
        `[apiMutation] 401 detected for ${endpoint}. Attempting refresh token...`,
      );
      try {
        await refreshAccessToken();
        console.debug(
          `[apiMutation] Refresh token succeeded. Retrying ${endpoint}...`,
        );
        return await internalApiMutation<T>({
          method,
          endpoint,
          body,
          headers,
        });
      } catch (refreshErr) {
        console.error(`[apiMutation] Refresh token failed:`, refreshErr);
        throw new Error("Session expired. Please log in again.");
      }
    }

    let errorMessage = "An unexpected error occurred";

    // Try to extract error message from different response formats
    if (err.response?.data) {
      const { data } = err.response;

      // Handle different error response formats
      if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data);
          errorMessage =
            parsed.message || parsed.error || JSON.stringify(parsed);
        } catch {
          errorMessage = data;
        }
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage =
          typeof data.error === "string"
            ? data.error
            : JSON.stringify(data.error);
      } else {
        errorMessage = JSON.stringify(data);
      }
    } else if (err.message) {
      errorMessage = err.message;
    }

    // Clean up the error message
    errorMessage = errorMessage.replace(/^Error: /, "").trim();

    // Create new error with the extracted message
    const error = new Error(errorMessage);
    // Preserve the original error stack
    error.stack = err.stack;
    // Attach the original error for debugging
    (error as any).originalError = err;

    throw error;
  }
}

// Internal helpers for actual axiosInstance calls
async function internalApiMutation<T = any>({
  method,
  endpoint,
  body,
  headers = {},
}: ApiRequestOptions): Promise<T> {
  const res = await axiosInstance.request({
    url: `/api/v1/${endpoint}`,
    method,
    data: body,
    headers,
  });
  return res.data;
}

async function internalApiQuery<T>(
  endpoint: string,
  headers: Record<string, string> = {},
): Promise<T> {
  const res = await axiosInstance.get(`/api/v1/${endpoint}`, { headers });
  return res.data;
}

/**
 * Upload a futsal image using fetch and FormData (no axios).
 * @param futsalId - The futsal's id
 * @param file - The image file to upload
 * @returns The parsed JSON response from the server
 */
export async function uploadFutsalImage(
  futsalId: string,
  file: File,
): Promise<any> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`/api/v1/futsals/${futsalId}/update-image`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to upload image");
  }
  return res.json();
}

import axios from "axios";
const axiosInstance = axios.create({
  withCredentials: true,
});
export type ApiMethod = "POST" | "PUT" | "PATCH" | "DELETE";
export interface ApiRequestOptions {
  method: ApiMethod;
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
}
let csrfToken: string | null = null;
let tokenExpiry: number | null = null;
const TOKEN_LIFETIME = 24 * 60 * 60 * 1000;
let refreshAttempts = 0;
let lastRefreshAttempt = 0;
const MAX_REFRESH_ATTEMPTS = 2;
const REFRESH_COOLDOWN = 5000;
async function fetchCsrfToken(): Promise<string> {
  try {
    console.debug("[fetchCsrfToken] Fetching new CSRF token...");
    const response = await axiosInstance.get("/api/v1/csrf-token");
    const token = response.data.csrfToken;
    if (!token) {
      throw new Error("No CSRF token received from server");
    }
    csrfToken = token;
    tokenExpiry = Date.now() + TOKEN_LIFETIME;
    console.debug("[fetchCsrfToken] CSRF token fetched successfully");
    return token;
  } catch (error) {
    console.error("[fetchCsrfToken] Failed to fetch CSRF token:", error);
    throw new Error("Failed to fetch CSRF token");
  }
}
async function getValidCsrfToken(): Promise<string> {
  if (csrfToken && tokenExpiry && Date.now() < tokenExpiry) {
    return csrfToken;
  }
  return await fetchCsrfToken();
}
async function refreshAccessToken() {
  const now = Date.now();
  if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
    console.debug(
      "[refreshAccessToken] Max refresh attempts reached, skipping...",
    );
    throw new Error("Max refresh attempts reached");
  }
  if (now - lastRefreshAttempt < REFRESH_COOLDOWN) {
    console.debug("[refreshAccessToken] Refresh cooldown active, skipping...");
    throw new Error("Refresh cooldown active");
  }
  try {
    console.debug("[refreshAccessToken] Attempting refresh...");
    refreshAttempts++;
    lastRefreshAttempt = now;
    const csrfToken = await getValidCsrfToken();
    await internalApiMutation({
      method: "POST",
      endpoint: "users/refresh-token",
      headers: { "X-CSRF-Token": csrfToken },
    });
    console.debug("[refreshAccessToken] Refresh succeeded.");
    refreshAttempts = 0;
  } catch (err) {
    console.error("[refreshAccessToken] Refresh failed:", err);
    throw new Error("Session expired. Please log in again.");
  }
}
export function resetRefreshAttempts() {
  refreshAttempts = 0;
  lastRefreshAttempt = 0;
}
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
    if (err.response?.data) {
      const { data } = err.response;
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
    errorMessage = errorMessage.replace(/^Error: /, "").trim();
    const error = new Error(errorMessage);
    error.stack = err.stack;
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
    const csrfToken = await getValidCsrfToken();
    const headersWithCsrf = {
      ...headers,
      "X-CSRF-Token": csrfToken,
    };
    return await internalApiMutation<T>({
      method,
      endpoint,
      body,
      headers: headersWithCsrf,
    });
  } catch (err: any) {
    if (err.response && err.response.status === 403) {
      const errorData = err.response.data;
      if (
        errorData &&
        (errorData.message?.includes("CSRF") ||
          errorData.error?.includes("CSRF"))
      ) {
        console.debug(
          "[apiMutation] CSRF token error detected, refreshing token...",
        );
        try {
          csrfToken = null;
          tokenExpiry = null;
          const newCsrfToken = await fetchCsrfToken();
          const headersWithNewCsrf = {
            ...headers,
            "X-CSRF-Token": newCsrfToken,
          };
          return await internalApiMutation<T>({
            method,
            endpoint,
            body,
            headers: headersWithNewCsrf,
          });
        } catch (csrfRefreshErr) {
          console.error(
            "[apiMutation] Failed to refresh CSRF token:",
            csrfRefreshErr,
          );
          throw new Error(
            "CSRF token validation failed. Please refresh the page and try again.",
          );
        }
      }
    }
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
    if (err.response?.data) {
      const { data } = err.response;
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
    errorMessage = errorMessage.replace(/^Error: /, "").trim();
    const error = new Error(errorMessage);
    error.stack = err.stack;
    (error as any).originalError = err;
    throw error;
  }
}
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
export async function uploadFutsalImage(
  futsalId: string,
  file: File,
): Promise<any> {
  const csrfToken = await getValidCsrfToken();
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`/api/v1/futsals/${futsalId}/update-image`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
    body: formData,
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to upload image");
  }
  return res.json();
}

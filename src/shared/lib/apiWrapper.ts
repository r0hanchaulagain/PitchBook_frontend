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
	headers: Record<string, string> = {}
): Promise<T> {
	try {
		return await internalApiQuery<T>(endpoint, headers);
	} catch (err: any) {
		if (err.response && err.response.status === 401) {
			console.debug(`[apiQuery] 401 detected for ${endpoint}. Attempting refresh token...`);
			try {
				await refreshAccessToken();
				console.debug(`[apiQuery] Refresh token succeeded. Retrying ${endpoint}...`);
				return await internalApiQuery<T>(endpoint, headers);
			} catch (refreshErr) {
				console.error(`[apiQuery] Refresh token failed:`, refreshErr);
				throw new Error("Session expired. Please log in again.");
			}
		}
		let msg = "API error";
		if (err.response && err.response.data && err.response.data.error) {
			msg = err.response.data.error;
		}
		throw new Error(msg);
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
			console.debug(`[apiMutation] 401 detected for ${endpoint}. Attempting refresh token...`);
			try {
				await refreshAccessToken();
				console.debug(`[apiMutation] Refresh token succeeded. Retrying ${endpoint}...`);
				return await internalApiMutation<T>({ method, endpoint, body, headers });
			} catch (refreshErr) {
				console.error(`[apiMutation] Refresh token failed:`, refreshErr);
				throw new Error("Session expired. Please log in again.");
			}
		}
		let msg = "API error";
		if (err.response && err.response.data && err.response.data.error) {
			msg = err.response.data.error;
		}
		throw new Error(msg);
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
	headers: Record<string, string> = {}
): Promise<T> {
	const res = await axiosInstance.get(`/api/v1/${endpoint}`, { headers });
	return res.data;
}

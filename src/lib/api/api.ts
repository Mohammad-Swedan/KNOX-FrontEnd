import type { PaginatedResponse } from "./types";

//const BASE = "https://knox.premiumasp.net/api";
const BASE = "https://localhost:6001/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const token = localStorage.getItem("accessToken");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function getPaginated<T>(
  path: string,
  pageNumber = 1,
  pageSize = 50,
  extra = "",
): Promise<PaginatedResponse<T>> {
  const url = `${path}?pageNumber=${pageNumber}&pageSize=${pageSize}${
    extra ? `&${extra}` : ""
  }`;
  return request<PaginatedResponse<T>>(url);
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse>("/Auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export default { request, getPaginated, login };

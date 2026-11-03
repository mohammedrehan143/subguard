import { createBrowserSupabaseClient } from "./supabase/browser";
import { isSupabaseConfigured } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function getAuthHeader(): Promise<string> {
  if (typeof window === "undefined") {
    return "Bearer demo-token";
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        return `Bearer ${data.session.access_token}`;
      }
    } catch {
      // Fallback to demo token if session fetch fails
    }
  }

  return "Bearer demo-token";
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const authHeader = await getAuthHeader();
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: authHeader,
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      let errorData: any = null;
      try {
        errorData = await response.json();
        if (typeof errorData.detail === "string") {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: any) => e.msg).join(", ");
        }
      } catch {
        // Body was not JSON
      }
      throw new ApiError(response.status, errorMessage, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      0,
      error?.message || "Failed to communicate with SubGuard API server."
    );
  }
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string | undefined>) => {
    let queryString = "";
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value);
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        queryString = `?${qs}`;
      }
    }
    return request<T>(`${path}${queryString}`, { method: "GET" });
  },

  post: <T>(path: string, body?: any) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: any) =>
    request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};


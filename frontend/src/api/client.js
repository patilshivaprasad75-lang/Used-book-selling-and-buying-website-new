const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "https://used-book-selling-and-buying-website.onrender.com";
// Every route string in src/api/*.js already starts with "/api", so strip any
// trailing slash and any trailing "/api" from the base URL to avoid "/api/api/...".
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, "").replace(/\/api$/, "");
const TOKEN_KEY = "ob_auth_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

let coldStartWarned = false;

/**
 * Core request helper. Talks to the Express backend which always
 * responds with { success, data | message }.
 */
export async function apiRequest(path, { method = "GET", body, headers = {}, isForm = false } = {}) {
  const finalHeaders = { ...headers };
  if (!isForm) finalHeaders["Content-Type"] = "application/json";

  const token = getToken();
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  // The free-tier backend host spins down after inactivity and can take
  // 30-60s to wake up on the very first request. Let the UI know so it can
  // show a friendly message instead of looking frozen.
  let slowTimer;
  if (!coldStartWarned) {
    slowTimer = setTimeout(() => {
      coldStartWarned = true;
      window.dispatchEvent(new CustomEvent("api:slow"));
    }, 4000);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Please make sure the backend is running and VITE_API_BASE_URL is correct.",
      0
    );
  } finally {
    clearTimeout(slowTimer);
  }

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : {};

  if (!response.ok) {
    throw new ApiError(payload.message || response.statusText || "Request failed", response.status);
  }

  return payload;
}

export const api = {
  get: (path) => apiRequest(path, { method: "GET" }),
  post: (path, body, opts = {}) => apiRequest(path, { method: "POST", body, ...opts }),
  put: (path, body, opts = {}) => apiRequest(path, { method: "PUT", body, ...opts }),
  del: (path, body) => apiRequest(path, { method: "DELETE", body }),
};

export { ApiError };

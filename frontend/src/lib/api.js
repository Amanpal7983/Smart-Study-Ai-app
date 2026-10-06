// Thin client for the StudyAI backend. Dev: Vite proxies /api -> http://localhost:4000
const BASE = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "studyai_token";

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};
export const setToken = (t) => {
  try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
};

async function request(method, path, body) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-TZ-Offset": String(new Date().getTimezoneOffset()),
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Is the backend running?");
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    if (res.status === 401 && getToken()) {
      setToken(null);
      window.dispatchEvent(new Event("studyai:unauthorized"));
    }
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (b) => request("POST", "/auth/register", b),
  login: (b) => request("POST", "/auth/login", b),
  me: () => request("GET", "/auth/me"),
  assessment: (b) => request("POST", "/assessment", b),
  planner: (b) => request("POST", "/planner", b),
  materials: (b) => request("POST", "/materials", b),
  items: (params = {}) => request("GET", `/items?${new URLSearchParams(params)}`),
  item: (id) => request("GET", `/items/${id}`),
  setSaved: (id, saved) => request("PATCH", `/items/${id}`, { saved }),
  remove: (id) => request("DELETE", `/items/${id}`),
  stats: () => request("GET", "/stats"),
};

export const timeAgo = (iso) => {
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? "Yesterday" : days < 7 ? `${days} days ago` : new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

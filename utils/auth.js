const STORAGE_KEY = 'lt_jwt';

/** Toggle OFF after we wire the backend */
const DEV_USE_MOCK = true;

// --- Token storage ---
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}
export function setToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, token);
}
export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// --- Networking helper (for later when DEV_USE_MOCK = false) ---
async function postJSON(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error((await res.text()) || 'Request failed');
  return res.json();
}

// --- Mock token for dev only ---
function makeFakeJwt(sub = (crypto?.randomUUID?.() || 'mock-user'), minutes = 60) {
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub, role: 'authenticated', iat: now, exp: now + minutes * 60 };
  return `mock.${btoa(JSON.stringify(payload))}.token`;
}

// --- Public API ---
export async function registerUsernamePin(username, pin) {
  if (DEV_USE_MOCK) {
    const token = makeFakeJwt();
    setToken(token);
    return { token };
  }
  // return postJSON('/functions/v1/register', { username, pin });
}

export async function loginUsernamePin(username, pin) {
  if (DEV_USE_MOCK) {
    const token = makeFakeJwt();
    setToken(token);
    return { token };
  }
  // return postJSON('/functions/v1/login', { username, pin });
}

export function logout() {
  clearToken();
}

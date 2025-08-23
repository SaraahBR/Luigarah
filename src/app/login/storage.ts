export type StoredUser = { name: string; email: string };

export const storageKey = "luigara:user";

export function loadUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: StoredUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey, JSON.stringify(user));
}

export function clearUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey);
}

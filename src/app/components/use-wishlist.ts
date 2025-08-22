"use client";

import { useCallback, useEffect, useState } from "react";

const DEFAULT_KEY = "wishlist-roupas";

export function useWishlist(storageKey: string = DEFAULT_KEY) {
  const [ids, setIds] = useState<number[]>([]);

  // Carrega do localStorage no mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Persiste toda vez que mudar
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(ids));
    } catch {
      // ignore
    }
  }, [ids, storageKey]);

  const isFav = useCallback((id: number) => ids.includes(id), [ids]);

  const toggle = useCallback((id: number) => {
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  return { ids, isFav, toggle, clear };
}

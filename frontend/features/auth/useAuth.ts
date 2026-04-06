// src/features/auth/useAuth.ts
import { useEffect, useState } from "react";
import { auth, onAuthStateChanged } from "../../src/lib/firebase";
import type { User } from "firebase/auth";

export default function useAuth(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { user, loading };
}

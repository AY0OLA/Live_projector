import { useEffect, useState } from "react";
import { auth } from "../../src/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  return { user };
}

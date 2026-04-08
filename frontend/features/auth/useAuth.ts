import { useEffect, useState } from "react";

type AuthUser = {
  token: string;
};

export default function useAuth(): {
  user: AuthUser | null;
  loading: boolean;
} {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setUser({ token });
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  return { user, loading };
}

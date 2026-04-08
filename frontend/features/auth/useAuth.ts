import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
  user_id: number;
  exp: number;
};

export type AuthUser = {
  id: number;
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
      try {
        const decoded: DecodedToken = jwtDecode(token);

        setUser({
          id: decoded.user_id, 
          token,
        });
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("token");
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  return { user, loading };
}

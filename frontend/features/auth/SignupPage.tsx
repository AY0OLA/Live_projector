import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!email || !password) {
      setError("Email and password are required");
      return false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      setError("Invalid email");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const signup = async () => {
    if (!validate()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      const loginRes = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        throw new Error("Login after signup failed");
      }

      localStorage.setItem("token", loginData.token);

      navigate("/app/live");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-card p-6 rounded-xl w-80 space-y-4">
        <h2 className="text-xl font-bold text-center">Create Account</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            signup();
          }}
          className="space-y-4"
          method="POST"
        >
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded bg-white text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded bg-white text-black border border-gray-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            disabled={loading}
            className="w-full bg-purple-600 p-3 rounded disabled:opacity-60"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <Link
          to="/login"
          className="block text-center text-blue-600 hover:underline"
        >
          I already have an account
        </Link>
      </div>
    </div>
  );
}

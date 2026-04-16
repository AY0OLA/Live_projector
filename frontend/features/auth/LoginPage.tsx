import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);

      navigate("/app/live");
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-card p-6 rounded-xl w-80 space-y-4"
        method="POST"
      >
        <h1 className="text-xl font-bold text-center">Login</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 rounded bg-white text-black"
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
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          disabled={loading}
          className="w-full bg-purple-600 p-2 rounded disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <Link
          to="/signup"
          className="block text-center text-blue-600 hover:underline"
        >
          Don’t have an account? Sign up
        </Link>
      </form>
    </div>
  );
}

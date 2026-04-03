import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../src/lib/firebase";
import { useNavigate } from "react-router-dom";

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
      setError("Please enter a valid email address");
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
      // 1) Create user with Firebase client SDK
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // 2) Optionally send verification email (non-fatal)
      try {
        if (userCredential.user && userCredential.user.email) {
          await sendEmailVerification(userCredential.user);
        }
      } catch (verErr) {
        console.warn("Email verification send failed", verErr);
      }

      // 3) Get Firebase ID token and send to backend (safer than sending password)
      //    Backend can verify token with Firebase Admin SDK and create a server-side user record.
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch("/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, idToken }),
      });

      // 4) Handle backend response
      if (!res.ok) {
        // try to parse error body
        const body = await res.json().catch(() => null);
        // Optionally: log or notify server about partial account creation
        throw new Error(body?.message || `Signup failed (${res.status})`);
      }

      // 5) Backend returned OK — navigate
      navigate("/");
    } catch (err) {
      console.error("Signup error", err);
      const code = err?.code || "";
      if (code.includes("auth/email-already-in-use")) {
        setError("This email is already registered. Try logging in.");
      } else if (code.includes("auth/invalid-email")) {
        setError("Invalid email address.");
      } else if (code.includes("auth/weak-password")) {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        // show friendly message; log details server-side
        setError(err?.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-card p-6 rounded-xl w-80 space-y-4">
        <h2 className="text-[2rem] font-bold text-center">Create Account</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            signup();
          }}
          className="space-y-4"
          aria-labelledby="signup-heading"
        >
          <label className="sr-only" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            autoComplete="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="sr-only" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            autoComplete="new-password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <p role="alert" className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-busy={loading}
          >
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <a
          href="/login"
          className="block text-center text-blue-600 hover:underline"
        >
          I have an account already
        </a>
      </div>
    </div>
  );
}

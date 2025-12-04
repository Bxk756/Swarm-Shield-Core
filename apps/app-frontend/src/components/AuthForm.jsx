import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("signin"); // signin | signup
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fn =
      mode === "signin"
        ? supabase.auth.signInWithPassword
        : supabase.auth.signUp;

    const { data, error } = await fn({
      email,
      password,
    });

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-20 bg-fg/5 p-8 rounded-xl shadow-xl border border-fg/20 backdrop-blur">
      <h1 className="text-2xl font-bold text-center mb-6">
        Swarm Shield Login 🛡
      </h1>

      {error && (
        <p className="bg-red-500/20 text-red-400 p-2 rounded mb-4 text-center">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded bg-bg border border-fg/20 focus:outline-none focus:ring-2 focus:ring-brand"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="p-3 rounded bg-bg border border-fg/20 focus:outline-none focus:ring-2 focus:ring-brand"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="p-3 rounded bg-brand hover:bg-brand-light transition font-semibold text-white"
        >
          {loading ? "Loading…" : mode === "signin" ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-sm mt-4">
        {mode === "signin" ? (
          <>
            Don’t have an account?{" "}
            <button
              onClick={() => setMode("signup")}
              className="text-brand underline"
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            Already registered?{" "}
            <button
              onClick={() => setMode("signin")}
              className="text-brand underline"
            >
              Sign In
            </button>
          </>
        )}
      </p>
    </div>
  );
}

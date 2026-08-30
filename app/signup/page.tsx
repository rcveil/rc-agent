"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://rc-agent.vercel.app/app/onboarding",
      },
    });
    console.log("signup data:", JSON.stringify(data));
    if (error) {
      console.error("signup error:", JSON.stringify({ message: error.message, status: error.status, code: (error as { code?: string }).code }));
      setError(`${error.message} [status=${error.status}, code=${(error as { code?: string }).code}]`);
      setLoading(false);
    } else {
      router.push("/app/onboarding");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-stone-900">Create account</h1>
          <p className="mt-1 text-sm text-stone-500">Start your child&apos;s growth journal</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
              placeholder="min. 6 characters"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 break-all">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-stone-900 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-stone-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const YEARS = [1, 2, 3, 4, 5, 6];

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [schoolYear, setSchoolYear] = useState<number>(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expired. Please sign in again.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("children").insert({
      parent_id: user.id,
      name: name.trim(),
      school_year: schoolYear,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/app/checkin");
      router.refresh();
    }
  }

  return (
    <div className="pt-8">
      <h1 className="text-xl font-semibold text-stone-900">Add your child</h1>
      <p className="mt-1 text-sm text-stone-500">
        We&apos;ll tailor the reflection questions to their age group.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Child&apos;s first name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
            placeholder="e.g. Aiden"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Primary school year
          </label>
          <select
            value={schoolYear}
            onChange={(e) => setSchoolYear(Number(e.target.value))}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                Primary {y} {y <= 3 ? "(P1–P3)" : "(P4–P6)"}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-stone-900 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}

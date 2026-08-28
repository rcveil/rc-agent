"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DIMENSION_LABELS, DIMENSION_COLORS, type Question } from "@/lib/questions";

interface Child {
  id: string;
  name: string;
  school_year: number;
  parent_id: string;
}

interface Props {
  child: Child;
  question: Question;
}

export default function CheckInForm({ child, question }: Props) {
  const router = useRouter();
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!response.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expired.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("log_entries").insert({
      child_id: child.id,
      parent_id: user.id,
      question_id: question.id,
      question_text: question.text,
      dimension: question.dimension,
      response: response.trim(),
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSaved(true);
    }
  }

  if (saved) {
    return (
      <div className="pt-8 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="text-lg font-semibold text-stone-900">Saved</h2>
        <p className="mt-1 text-sm text-stone-500">
          You&apos;re done for today. Come back tomorrow.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={() => router.push("/app/logbook")}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
          >
            View logbook
          </button>
          <button
            onClick={() => router.refresh()}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
          >
            Another question
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <p className="text-sm text-stone-500">
        Reflecting on <span className="font-medium text-stone-700">{child.name}</span>
      </p>
      <span
        className={`mt-3 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${DIMENSION_COLORS[question.dimension]}`}
      >
        {DIMENSION_LABELS[question.dimension]}
      </span>
      <h2 className="mt-3 text-lg font-medium leading-snug text-stone-900">
        {question.text}
      </h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <textarea
          required
          rows={5}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Write what you observed today…"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none resize-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !response.trim()}
          className="w-full rounded-lg bg-stone-900 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-40"
        >
          {loading ? "Saving…" : "Save entry"}
        </button>
      </form>
    </div>
  );
}

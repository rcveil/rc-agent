import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DIMENSION_LABELS, DIMENSION_COLORS, type Dimension } from "@/lib/questions";

export default async function LogbookPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: children } = await supabase
    .from("children")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1);

  if (!children || children.length === 0) {
    redirect("/app/onboarding");
  }

  const child = children[0];

  const { data: entries } = await supabase
    .from("log_entries")
    .select("*")
    .eq("child_id", child.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900">
        {child.name}&apos;s journal
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        {entries?.length ?? 0} {entries?.length === 1 ? "entry" : "entries"}
      </p>

      {!entries || entries.length === 0 ? (
        <div className="mt-12 text-center text-stone-400 text-sm">
          No entries yet. Start with today&apos;s check-in.
        </div>
      ) : (
        <ol className="mt-6 space-y-4">
          {entries.map((entry) => {
            const date = new Date(entry.created_at);
            const label = date.toLocaleDateString("en-SG", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <li
                key={entry.id}
                className="rounded-xl border border-stone-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      DIMENSION_COLORS[entry.dimension as Dimension]
                    }`}
                  >
                    {DIMENSION_LABELS[entry.dimension as Dimension]}
                  </span>
                  <time className="text-xs text-stone-400">{label}</time>
                </div>
                <p className="mt-2 text-sm text-stone-500 italic">
                  {entry.question_text}
                </p>
                <p className="mt-1.5 text-sm text-stone-800 whitespace-pre-wrap">
                  {entry.response}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

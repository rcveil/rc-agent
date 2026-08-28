import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pickQuestion } from "@/lib/questions";
import CheckInForm from "./CheckInForm";

export default async function CheckInPage() {
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

  const { data: recent } = await supabase
    .from("log_entries")
    .select("question_id")
    .eq("child_id", child.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const recentIds = (recent ?? []).map((r) => r.question_id);
  const question = pickQuestion(child.school_year, recentIds);

  return <CheckInForm child={child} question={question} />;
}

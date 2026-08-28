"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const links = [
    { href: "/app/checkin", label: "Check-in" },
    { href: "/app/logbook", label: "Logbook" },
  ];

  return (
    <header className="border-b border-stone-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-xl items-center justify-between">
        <span className="text-sm font-semibold text-stone-900">Grow</span>
        <nav className="flex items-center gap-4">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm ${
                pathname === href
                  ? "font-medium text-stone-900"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            className="text-sm text-stone-400 hover:text-stone-600"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}

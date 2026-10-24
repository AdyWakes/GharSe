"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Lang } from "@/lib/i18n";

export function LangToggle({ lang, label, className }: { lang: Lang; label: string; className?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const next: Lang = lang === "hi" ? "en" : "hi";
  return (
    <button
      type="button"
      disabled={pending}
      lang={next}
      className={className}
      onClick={() =>
        start(async () => {
          await fetch("/api/lang", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lang: next }),
          });
          router.refresh();
        })
      }
    >
      {label}
    </button>
  );
}

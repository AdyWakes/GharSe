import { redirect } from "next/navigation";
import { LangToggle } from "@/components/LangToggle";
import { translator } from "@/lib/i18n";
import { currentLang } from "@/lib/lang";
import { currentSeller } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (await currentSeller()) redirect("/chat");
  const lang = await currentLang();
  const tr = translator(lang);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-6">
      <div className="flex justify-end">
        <LangToggle
          lang={lang}
          label={tr("nav.switchLang")}
          className="min-h-12 rounded-full border border-ink/15 px-5 text-base font-medium"
        />
      </div>

      <div className="mt-10">
        <h1 className="text-5xl font-bold tracking-tight">
          Ghar<span className="text-chilli">Se</span>
        </h1>
        <p className="mt-2 text-xl text-muted">{tr("tagline")}</p>
      </div>

      <LoginForm
        labels={{
          title: tr("login.title"),
          hint: tr("login.hint"),
          placeholder: tr("login.placeholder"),
          button: tr("login.button"),
          invalid: tr("login.invalid"),
        }}
      />

      <div className="mt-auto pt-10">
        {/* Plain <a>, not <Link>: /demo resets data and must never be prefetched. */}
        <a
          href="/demo"
          className="flex min-h-14 items-center justify-center rounded-2xl bg-turmeric text-lg font-semibold text-ink"
        >
          {tr("login.demo")}
        </a>
      </div>
    </main>
  );
}

// Seller dashboard, phase 1 version: her products at a glance.
// Phase 6 adds readiness state, batches, labels and the decision trail.
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatIcon } from "@/components/icons";
import { LangToggle } from "@/components/LangToggle";
import { db } from "@/lib/db";
import { translator } from "@/lib/i18n";
import { currentLang } from "@/lib/lang";
import { currentSeller } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const seller = await currentSeller();
  if (!seller) redirect("/");
  const lang = await currentLang();
  const tr = translator(lang);

  const products = await db.product.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { batches: true } } },
  });
  const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  return (
    <main className="mx-auto min-h-dvh max-w-md px-4 pb-24 pt-4">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">{tr("dash.title")}</h1>
        <LangToggle
          lang={lang}
          label={tr("nav.switchLang")}
          className="min-h-11 rounded-full border border-ink/15 px-4 text-sm font-medium"
        />
      </header>
      {seller.name && <p className="mt-1 text-muted">{seller.name}</p>}

      {products.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white p-4 text-lg">{tr("dash.empty")}</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3">
          {products.map((p) => (
            <li key={p.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-lg font-semibold">{lang === "hi" ? p.nameHi : p.nameEn}</p>
              <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-muted">{tr("dash.pack")}</dt>
                  <dd className="font-medium">{p.packSizeG} g</dd>
                </div>
                <div>
                  <dt className="text-muted">{tr("dash.price")}</dt>
                  <dd className="font-medium">
                    {p.currentPriceInr != null ? rupees.format(p.currentPriceInr) : tr("dash.noPrice")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">{tr("dash.batches")}</dt>
                  <dd className="font-medium">{p._count.batches}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-sm text-muted">{tr("dash.comingSoon")}</p>

      <Link
        href="/chat"
        className="fixed bottom-5 left-1/2 flex min-h-14 -translate-x-1/2 items-center gap-2 rounded-full bg-wa-accent px-6 text-lg font-semibold text-white shadow-lg"
      >
        <ChatIcon className="size-6" />
        {tr("nav.chat")}
      </Link>
    </main>
  );
}

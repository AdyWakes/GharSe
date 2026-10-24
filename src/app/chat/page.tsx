import { redirect } from "next/navigation";
import { serviceModes } from "@/lib/config";
import { db } from "@/lib/db";
import { dictionary } from "@/lib/i18n";
import { currentLang } from "@/lib/lang";
import { toClientMessage } from "@/lib/messages";
import { currentSeller } from "@/lib/session";
import { ChatClient } from "./ChatClient";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const seller = await currentSeller();
  if (!seller) redirect("/");
  const lang = await currentLang();

  const rows = await db.message.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <ChatClient
      lang={lang}
      dict={dictionary(lang)}
      initial={rows.reverse().map(toClientMessage)}
      modes={serviceModes()}
    />
  );
}

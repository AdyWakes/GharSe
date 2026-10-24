// Decision trail: every agent action is written here with a plain-language
// reason, so the judges can see why the agent did what it did.
import { db } from "@/lib/db";

export type DecisionActor = "agent" | "planner" | "core" | "system" | "seller";

export interface DecisionInput {
  sellerId: string;
  productId?: string | null;
  action: string;
  reason: string;
  detail?: Record<string, unknown>;
  ruleIds?: string[];
  actor?: DecisionActor;
}

export async function logDecision(d: DecisionInput) {
  return db.decisionLog.create({
    data: {
      sellerId: d.sellerId,
      productId: d.productId ?? null,
      action: d.action,
      reason: d.reason,
      detail: JSON.stringify(d.detail ?? {}),
      ruleIds: JSON.stringify(d.ruleIds ?? []),
      actor: d.actor ?? "agent",
    },
  });
}

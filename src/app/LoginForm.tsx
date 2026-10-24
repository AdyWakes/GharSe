"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Labels = { title: string; hint: string; placeholder: string; button: string; invalid: string };

export function LoginForm({ labels }: { labels: Labels }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) router.push("/chat");
    else setError(true);
  }

  return (
    <form onSubmit={submit} className="mt-12 flex flex-col gap-4">
      <label htmlFor="phone" className="text-2xl font-semibold">
        {labels.title}
      </label>
      <p className="-mt-2 text-base text-muted">{labels.hint}</p>
      <div className="flex min-h-14 items-center rounded-2xl border-2 border-ink/20 bg-white px-4 focus-within:border-wa-accent">
        <span className="pr-2 text-lg text-muted">+91</span>
        <input
          id="phone"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={14}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={labels.placeholder}
          aria-invalid={error}
          className="min-w-0 flex-1 bg-transparent py-3 text-xl tracking-wide outline-none"
        />
      </div>
      {error && (
        <p role="alert" className="text-base font-medium text-chilli">
          {labels.invalid}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="min-h-14 rounded-2xl bg-wa-header text-lg font-semibold text-white disabled:opacity-60"
      >
        {labels.button}
      </button>
    </form>
  );
}

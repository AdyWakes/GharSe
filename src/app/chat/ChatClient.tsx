"use client";
// WhatsApp-style chat simulator: text, photo upload and voice notes.
// Built for cheap Android phones on slow 3G: optimistic sends with retry,
// compressed photos, low-bitrate voice, slow polling only while visible.
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertIcon,
  CameraIcon,
  CheckIcon,
  ClockIcon,
  ListIcon,
  MicIcon,
  SendIcon,
  TrashIcon,
} from "@/components/icons";
import { LangToggle } from "@/components/LangToggle";
import type { QuickReply } from "@/channels/types";
import type { ServiceName } from "@/lib/config";
import type { Lang, MessageKey } from "@/lib/i18n";
import type { ClientMessage } from "@/lib/messages";
import { compressImage, MAX_RECORDING_SECONDS, pickAudioMime, VOICE_BITS_PER_SECOND } from "./media";
import { RichText } from "./RichText";

type Status = "sending" | "failed";
type UiMessage = ClientMessage & { status?: Status; localId?: string };
type Outgoing = { kind: "text" | "image" | "audio" | "button"; text?: string; buttonId?: string; blob?: Blob };

const POLL_MS = 8000;

function mergeMessages(current: UiMessage[], incoming: ClientMessage[]): UiMessage[] {
  const byId = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function ChatClient({
  lang,
  dict,
  initial,
  modes,
}: {
  lang: Lang;
  dict: Record<MessageKey, string>;
  initial: ClientMessage[];
  modes: Record<ServiceName, "live" | "mock">;
}) {
  const tr = (k: MessageKey) => dict[k];
  const [messages, setMessages] = useState<UiMessage[]>(initial);
  const [text, setText] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [showModes, setShowModes] = useState(false);
  const [recording, setRecording] = useState<{ seconds: number } | null>(null);
  const pendingSends = useRef(new Map<string, Outgoing>());
  const recorder = useRef<{ mr: MediaRecorder; stream: MediaStream; chunks: Blob[]; cancelled: boolean } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const anyMock = Object.values(modes).some((m) => m === "mock");
  const timeFmt = new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", { hour: "numeric", minute: "2-digit" });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // Slow poll for agent nudges, only while the tab is visible.
  const lastServerTime = useRef<string | null>(initial.at(-1)?.createdAt ?? null);
  useEffect(() => {
    const newest = messages.filter((m) => !m.status).at(-1)?.createdAt;
    if (newest) lastServerTime.current = newest;
  }, [messages]);
  useEffect(() => {
    const id = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      const q = lastServerTime.current ? `?after=${encodeURIComponent(lastServerTime.current)}` : "";
      const res = await fetch(`/api/sim/messages${q}`).catch(() => null);
      if (!res?.ok) return;
      const { messages: fresh } = (await res.json()) as { messages: ClientMessage[] };
      if (fresh.length) setMessages((cur) => mergeMessages(cur, fresh));
    }, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const send = useCallback(async (localId: string) => {
    const out = pendingSends.current.get(localId);
    if (!out) return;
    setMessages((cur) => cur.map((m) => (m.localId === localId ? { ...m, status: "sending" } : m)));

    const form = new FormData();
    form.set("kind", out.kind);
    if (out.text) form.set("text", out.text);
    if (out.buttonId) form.set("buttonId", out.buttonId);
    if (out.blob) form.set("file", out.blob, out.kind === "image" ? "photo.jpg" : "voice.webm");

    const res = await fetch("/api/sim/messages", { method: "POST", body: form }).catch(() => null);
    if (!res?.ok) {
      setMessages((cur) => cur.map((m) => (m.localId === localId ? { ...m, status: "failed" } : m)));
      return;
    }
    const { messages: saved } = (await res.json()) as { messages: ClientMessage[] };
    pendingSends.current.delete(localId);
    setMessages((cur) => mergeMessages(cur.filter((m) => m.localId !== localId), saved));
  }, []);

  const queue = useCallback(
    (out: Outgoing) => {
      const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      pendingSends.current.set(localId, out);
      const optimistic: UiMessage = {
        id: localId,
        localId,
        status: "sending",
        direction: "in",
        kind: out.kind === "button" ? "text" : out.kind,
        text: out.text ?? null,
        mediaUrl: out.blob ? URL.createObjectURL(out.blob) : null,
        mediaMime: out.blob?.type ?? null,
        transcript: null,
        buttons: null,
        createdAt: new Date().toISOString(),
      };
      setMessages((cur) => [...cur, optimistic]);
      void send(localId);
    },
    [send],
  );

  function submitText(e?: React.FormEvent) {
    e?.preventDefault();
    const value = text.trim();
    if (!value) return;
    setText("");
    queue({ kind: "text", text: value });
  }

  function tapButton(b: QuickReply) {
    queue({ kind: "button", text: b.title, buttonId: b.id });
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    queue({ kind: "image", blob: await compressImage(file) });
  }

  async function startRecording() {
    setNotice(null);
    const mime = pickAudioMime();
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setNotice(tr("chat.micUnsupported"));
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setNotice(tr("chat.micDenied"));
      return;
    }
    const mr = new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: VOICE_BITS_PER_SECOND });
    const state = { mr, stream, chunks: [] as Blob[], cancelled: false };
    recorder.current = state;
    mr.ondataavailable = (ev) => ev.data.size && state.chunks.push(ev.data);
    mr.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      recorder.current = null;
      setRecording(null);
      if (state.cancelled || state.chunks.length === 0) return;
      const blob = new Blob(state.chunks, { type: (mr.mimeType || mime || "audio/webm").split(";")[0] });
      queue({ kind: "audio", blob });
    };
    mr.start(1000);
    setRecording({ seconds: 0 });
  }

  function stopRecording(cancel: boolean) {
    const r = recorder.current;
    if (!r) return;
    r.cancelled = cancel;
    if (r.mr.state !== "inactive") r.mr.stop();
  }

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => {
      setRecording((r) => {
        if (!r) return r;
        if (r.seconds + 1 >= MAX_RECORDING_SECONDS) stopRecording(false);
        return { seconds: r.seconds + 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [recording !== null]);

  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col bg-wa-bg">
      {/* Header */}
      <header className="flex items-center gap-3 bg-wa-header px-3 py-2 text-white">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-chilli text-sm font-bold">
          GS
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold leading-tight">{tr("chat.assistantName")}</p>
          <div className="flex items-center gap-2 text-xs text-white/80">
            <span>{tr("chat.online")}</span>
            {anyMock && (
              <button
                type="button"
                onClick={() => setShowModes((v) => !v)}
                aria-expanded={showModes}
                className="rounded-full bg-turmeric px-2 py-0.5 font-semibold text-ink"
              >
                {tr("mock.badge")}
              </button>
            )}
          </div>
        </div>
        <LangToggle
          lang={lang}
          label={tr("nav.switchLang")}
          className="min-h-11 rounded-full px-3 text-sm font-medium hover:bg-white/10"
        />
        <Link
          href="/dashboard"
          aria-label={tr("nav.dashboard")}
          className="flex size-11 items-center justify-center rounded-full hover:bg-white/10"
        >
          <ListIcon className="size-6" />
        </Link>
      </header>

      {showModes && (
        <div className="border-b border-black/10 bg-white px-4 py-3 text-sm shadow-sm">
          <p className="mb-2 font-semibold">{tr("mock.title")}</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
            {(Object.keys(modes) as ServiceName[]).map((s) => (
              <li key={s} className="flex justify-between gap-2">
                <span>{tr(`mock.${s}` as MessageKey)}</span>
                <span className={modes[s] === "live" ? "font-semibold text-wa-accent" : "text-muted"}>
                  {tr(modes[s] === "live" ? "mock.live" : "mock.mock")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-3 py-3" aria-live="polite">
        {messages.length === 0 && (
          <p className="mx-auto mt-6 max-w-xs rounded-lg bg-[#fff5c4] px-3 py-2 text-center text-sm text-ink">
            {tr("chat.empty")}
          </p>
        )}
        <ul className="flex flex-col gap-1.5">
          {messages.map((m) => {
            const mine = m.direction === "in";
            return (
              <li key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <div
                  className={`relative max-w-[85%] rounded-lg px-2.5 pb-1 pt-1.5 text-[15px] shadow-sm ${
                    mine ? "rounded-tr-none bg-wa-mine" : "rounded-tl-none bg-wa-theirs"
                  }`}
                >
                  <Bubble m={m} tr={tr} />
                  <div className="mt-0.5 flex items-center justify-end gap-1 text-[11px] text-wa-meta">
                    <span>{timeFmt.format(new Date(m.createdAt))}</span>
                    {mine && <StatusIcon status={m.status} />}
                  </div>
                </div>
                {m.status === "failed" && m.localId && (
                  <button
                    type="button"
                    onClick={() => send(m.localId!)}
                    className="mt-1 min-h-11 rounded-full px-3 text-sm font-medium text-chilli"
                  >
                    {tr("chat.failed")}
                  </button>
                )}
                {m.buttons && (
                  <div className="mt-1 flex w-[85%] flex-col gap-1">
                    {m.buttons.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => tapButton(b)}
                        className="min-h-12 rounded-lg bg-white text-base font-medium text-wa-accent shadow-sm active:bg-white/70"
                      >
                        {b.title}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <div ref={bottomRef} />
      </main>

      {notice && (
        <p role="alert" className="bg-white px-4 py-2 text-sm font-medium text-chilli">
          {notice}
        </p>
      )}

      {/* Composer */}
      <div className="flex items-end gap-2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1">
        {recording ? (
          <div className="flex min-h-12 flex-1 items-center gap-3 rounded-full bg-white px-3 shadow-sm">
            <button
              type="button"
              onClick={() => stopRecording(true)}
              aria-label={tr("chat.cancel")}
              className="flex size-10 items-center justify-center rounded-full text-chilli"
            >
              <TrashIcon className="size-6" />
            </button>
            <span className="size-2.5 animate-pulse rounded-full bg-chilli" aria-hidden />
            <span className="text-base tabular-nums">{mmss(recording.seconds)}</span>
            <span className="truncate text-sm text-wa-meta">{tr("chat.recording")}</span>
          </div>
        ) : (
          <form onSubmit={submitText} className="flex min-h-12 flex-1 items-end rounded-3xl bg-white shadow-sm">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) submitText(e);
              }}
              rows={1}
              placeholder={tr("chat.placeholder")}
              aria-label={tr("chat.placeholder")}
              className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-4 py-3 text-base outline-none"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label={tr("chat.photo")}
              className="flex size-12 shrink-0 items-center justify-center text-wa-meta"
            >
              <CameraIcon className="size-6" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </form>
        )}
        {recording ? (
          <RoundButton label={tr("chat.send")} onClick={() => stopRecording(false)}>
            <SendIcon className="size-6" />
          </RoundButton>
        ) : text.trim() ? (
          <RoundButton label={tr("chat.send")} onClick={() => submitText()}>
            <SendIcon className="size-6" />
          </RoundButton>
        ) : (
          <RoundButton label={tr("chat.mic")} onClick={startRecording}>
            <MicIcon className="size-6" />
          </RoundButton>
        )}
      </div>
    </div>
  );
}

function RoundButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-12 shrink-0 items-center justify-center rounded-full bg-wa-accent text-white shadow-sm active:scale-95"
    >
      {children}
    </button>
  );
}

function StatusIcon({ status }: { status?: Status }) {
  if (status === "sending") return <ClockIcon className="size-3.5" />;
  if (status === "failed") return <AlertIcon className="size-3.5 text-chilli" />;
  return <CheckIcon className="size-3.5 text-wa-accent" />;
}

function Bubble({ m, tr }: { m: UiMessage; tr: (k: MessageKey) => string }) {
  if (m.kind === "image" && m.mediaUrl) {
    return (
      <img src={m.mediaUrl} alt={tr("chat.photoAlt")} loading="lazy" className="max-h-72 rounded-md object-cover" />
    );
  }
  if (m.kind === "audio" && m.mediaUrl) {
    return (
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-1 text-xs font-medium text-wa-meta">
          <MicIcon className="size-3.5" /> {tr("chat.voiceNote")}
        </span>
        <audio controls preload="none" src={m.mediaUrl} className="h-10 w-64 max-w-full" />
        {m.transcript && (
          <p className="text-sm text-ink/80">
            <span className="font-medium">{tr("chat.heard")}: </span>
            {m.transcript}
          </p>
        )}
      </div>
    );
  }
  return (
    <p className="whitespace-pre-wrap break-words">
      <RichText text={m.text ?? ""} />
    </p>
  );
}

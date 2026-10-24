// Media storage on local disk under STORAGE_DIR/<sellerId>/<file>.
// Swap for Supabase Storage in prod if the host's disk is ephemeral.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { config } from "./config";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "application/pdf": "pdf",
};

export function extForMime(mime: string): string {
  const base = mime.split(";")[0].trim().toLowerCase();
  return EXT_BY_MIME[base] ?? "bin";
}

export function mimeForPath(p: string): string {
  const ext = path.extname(p).slice(1).toLowerCase();
  const hit = Object.entries(EXT_BY_MIME).find(([, e]) => e === ext);
  return hit?.[0] ?? "application/octet-stream";
}

/** Saves bytes and returns the storage-relative path, e.g. "abc123/uuid.jpg". */
export async function saveMedia(sellerId: string, bytes: Buffer, mime: string): Promise<string> {
  const rel = `${sellerId}/${randomUUID()}.${extForMime(mime)}`;
  const abs = resolveMedia(rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, bytes);
  return rel;
}

/** Resolves a storage-relative path, refusing anything that escapes the root. */
export function resolveMedia(rel: string): string {
  const root = path.resolve(config.storageDir);
  const abs = path.resolve(root, rel);
  if (!abs.startsWith(root + path.sep)) throw new Error("invalid media path");
  return abs;
}

export async function readMedia(rel: string): Promise<Buffer> {
  return readFile(resolveMedia(rel));
}

export function mediaUrl(rel: string): string {
  return `/api/media/${rel}`;
}

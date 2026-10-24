// Browser-side media helpers for slow networks and cheap phones.

/**
 * Shrinks a photo before upload: longest side 1280 px, JPEG quality 0.7.
 * A 4 MB phone photo usually ends up around 150 to 300 KB.
 * Falls back to the original file if the browser cannot decode it.
 */
export async function compressImage(file: File, maxDim = 1280, quality = 0.7): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

/** Picks a recording format the browser supports. Opus in WebM on Android Chrome. */
export function pickAudioMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const options = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  return options.find((m) => MediaRecorder.isTypeSupported(m));
}

/** Low bitrate is plenty for speech and keeps voice notes small on 3G. */
export const VOICE_BITS_PER_SECOND = 24_000;
export const MAX_RECORDING_SECONDS = 120;

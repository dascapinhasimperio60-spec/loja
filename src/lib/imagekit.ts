import "server-only";
import { createHmac, randomUUID } from "node:crypto";

/**
 * ImageKit (free plan, no credit card).
 * The browser uploads straight to ImageKit with a short-lived signature
 * generated here, so image bytes never pass through (or bill) a Vercel function.
 * The private key never leaves the server.
 */
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ?? "";
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY ?? "";
const urlEndpoint = (process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "").replace(/\/$/, "");

export const hasImageKit = Boolean(publicKey && privateKey && urlEndpoint);

export type UploadAuth = { token: string; expire: number; signature: string; publicKey: string };

/** One signature per file; ImageKit rejects a reused token. Max lifetime is 1 hour. */
export function createUploadAuth(expiresSeconds = 900): UploadAuth {
  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + expiresSeconds;
  const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");
  return { token, expire, signature, publicKey };
}

export function isFileId(id: unknown): id is string {
  return typeof id === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(id);
}

export async function deleteFiles(fileIds: string[]) {
  const ids = Array.from(new Set(fileIds.filter(isFileId)));
  if (!ids.length) return;
  const res = await fetch("https://api.imagekit.io/v1/files/batch/deleteByFileIds", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileIds: ids }),
  });
  if (!res.ok) console.error("[imagekit] delete failed", res.status, await res.text().catch(() => ""));
}

// Browser-side lightweight encryption helpers using Web Crypto API.
// This is intentionally minimal for the takehome: it derives a key from a static passphrase.
// For production, use a secure key storage and do not hardcode secrets.

const PASS = "change-this-secret"; // TODO: replace with a secure secret in real app
const SALT = "fullstack-takehome-salt";

function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(b64: string) {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getKeyMaterial(passphrase: string) {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
}

async function deriveKey(passphrase: string) {
  const keyMaterial = await getKeyMaterial(passphrase);
  const enc = new TextEncoder();
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(SALT),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encrypt(plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(PASS);
  const enc = new TextEncoder();
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plain),
  );
  // return iv + ciphertext as base64
  const ivB64 = toBase64(iv.buffer);
  const ctB64 = toBase64(ct);
  return ivB64 + "." + ctB64;
}

export async function decrypt(payload: string): Promise<string | null> {
  try {
    const [ivB64, ctB64] = payload.split(".");
    if (!ivB64 || !ctB64) return null;
    const iv = new Uint8Array(fromBase64(ivB64));
    const ct = fromBase64(ctB64);
    const key = await deriveKey(PASS);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
    const dec = new TextDecoder();
    return dec.decode(plain);
  } catch (e) {
    console.error("decrypt error", e);
    return null;
  }
}

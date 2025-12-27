/**
 * HMAC Authentication Utility
 *
 * Generates HMAC signatures for API requests to authenticate
 * with the backend API gateway.
 */

const HMAC_CLIENT_ID = process.env.NEXT_PUBLIC_HMAC_CLIENT_ID || "frontend";
const HMAC_SECRET = process.env.NEXT_PUBLIC_HMAC_SECRET || "";

/**
 * Generate HMAC signature for a request using Web Crypto API
 */
async function generateSignature(
  signatureString: string,
  secret: string,
  algorithm: "hmac-sha256" | "hmac-sha512" = "hmac-sha256",
): Promise<string> {
  // Check if we're in a browser environment with Web Crypto API
  if (globalThis.crypto?.subtle === undefined) {
    console.warn("Web Crypto API not available");
    return "";
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(signatureString);

  const cryptoAlgorithm =
    algorithm === "hmac-sha512"
      ? { name: "HMAC", hash: "SHA-512" }
      : { name: "HMAC", hash: "SHA-256" };

  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    keyData,
    cryptoAlgorithm,
    false,
    ["sign"],
  );

  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    messageData,
  );

  // Convert to base64
  const bytes = new Uint8Array(signature);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCodePoint(bytes[i]);
  }
  return globalThis.btoa(binary);
}

/**
 * Build the signature string from headers
 */
function buildSignatureString(
  method: string,
  path: string,
  headers: Record<string, string>,
  headerNames: string[],
): string {
  return headerNames
    .map((key) => {
      if (key.toLowerCase() === "@request-target") {
        return `${method.toLowerCase()} ${path}`;
      }
      return `${key.toLowerCase()}: ${headers[key.toLowerCase()] || ""}`;
    })
    .join("\n");
}

/**
 * Generate the Proxy-Authorization header value for HMAC authentication
 */
export async function generateHmacHeader(
  method: string = "POST",
  path: string = "/api",
): Promise<string> {
  if (!HMAC_SECRET) {
    return "";
  }

  const algorithm = "hmac-sha256";
  const headerNames = ["@request-target", "content-type"];
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  const signatureString = buildSignatureString(
    method,
    path,
    headers,
    headerNames,
  );

  const signature = await generateSignature(signatureString, HMAC_SECRET);

  const credentials = {
    username: HMAC_CLIENT_ID,
    algorithm,
    headers: headerNames.join(","),
    signature,
  };

  return `HMAC ${JSON.stringify(credentials)}`;
}

// pkce.ts
function generateRandomString(length: number) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  return Array.from(
    { length },
    () => charset[Math.floor(Math.random() * charset.length)],
  ).join("");
}

async function generateCodeChallenge(codeVerifier: string) {
  const buffer = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function createPKCECodes() {
  const codeVerifier = generateRandomString(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  // localStorage.setItem("pkce_code_verifier", codeVerifier); // Save for token exchange
  sessionStorage.setItem("pkce_code_verifier", codeVerifier);
  return codeChallenge;
}

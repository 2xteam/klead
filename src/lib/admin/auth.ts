/**
 * 관리자 세션 쿠키 유틸. Edge(middleware) / Node(route) 양쪽에서 동작하도록
 * Web Crypto(HMAC-SHA256)만 사용한다. 비밀번호 자체는 저장/전송하지 않고,
 * AUTH_SECRET 기반 HMAC 토큰만 쿠키에 담는다.
 */
export const ADMIN_COOKIE = "klead_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 24 * 7; // 7일

const encoder = new TextEncoder();

export async function adminSessionToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET ?? "klead-dev-secret";
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("klead-admin-session-v1"),
  );
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidAdminCookie(
  value: string | undefined,
): Promise<boolean> {
  if (!value) return false;
  const expected = await adminSessionToken();
  // 길이 동일 가정 하 상수시간 비교
  if (value.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < value.length; i++) {
    diff |= value.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

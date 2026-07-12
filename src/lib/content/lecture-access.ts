import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import connectDB from "@/lib/db/mongodb";
import { LectureAccess } from "@/lib/db/models";

/**
 * 강의 열람권 로직 — 회원 귀속 열람권 / 시크릿키 임시 열람권 / 서명 쿠키.
 * 보안: 시크릿키는 평문 저장하지 않고 SHA-256 해시로만 비교(timing-safe),
 *      통과 시 HMAC 서명 쿠키를 발급해 재검증 없이 열람을 허용한다.
 */

const SECRET =
  process.env.AUTH_SECRET ||
  process.env.ACCESS_SECRET ||
  "klead-access-fallback-secret-change-me";

/** 시크릿키 해시(저장/비교용) */
export function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

/** 공유 코드(공개 토큰) 생성용 — 예측 불가 랜덤 */
export function randomCode(): string {
  return createHash("sha256")
    .update(SECRET + ":" + Math.random() + ":" + process.hrtime.bigint())
    .digest("base64url")
    .slice(0, 22);
}

/** 강의별 서명 쿠키 이름 */
export function gateCookieName(contentId: string): string {
  return `lg_${contentId}`;
}

/** HMAC 서명 토큰 생성: contentId.exp.sig */
export function signGateToken(contentId: string, expMs: number): string {
  const body = `${contentId}.${expMs}`;
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

/** 서명 쿠키 검증 — contentId 일치 + 미만료 + 서명 유효 */
export function verifyGateToken(
  token: string | undefined,
  contentId: string,
): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [cid, expStr, sig] = parts;
  if (cid !== contentId) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = createHmac("sha256", SECRET)
    .update(`${cid}.${expStr}`)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function withinPeriod(startAt?: Date | null, endAt?: Date | null): boolean {
  const now = Date.now();
  if (startAt && new Date(startAt).getTime() > now) return false;
  if (endAt && new Date(endAt).getTime() < now) return false;
  return true;
}

/** 회원 귀속 열람권 보유 여부 */
export async function hasMemberLectureAccess(
  userId: string,
  contentId: string,
): Promise<boolean> {
  await connectDB();
  const grants = await LectureAccess.find({
    contentId,
    userId,
    isActive: true,
  })
    .select("startAt endAt")
    .lean();
  return grants.some((g) => withinPeriod(g.startAt, g.endAt));
}

/** 회원이 열람권을 보유한 강의 contentId 집합 (courses 게이팅용) */
export async function getUserGrantedContentIds(
  userId: string,
): Promise<Set<string>> {
  await connectDB();
  const grants = await LectureAccess.find({ userId, isActive: true })
    .select("contentId startAt endAt")
    .lean();
  const set = new Set<string>();
  grants.forEach((g) => {
    if (withinPeriod(g.startAt, g.endAt)) set.add(String(g.contentId));
  });
  return set;
}

/**
 * 시크릿키 검증. code로 시크릿 열람권을 찾아 키 해시를 timing-safe 비교.
 * 성공 시 남은 기간(ms)을 반환(무기한이면 24h) — 서명 쿠키 TTL로 사용.
 */
export async function verifySecretGrant(
  code: string,
  key: string,
  contentId: string,
): Promise<{ ok: boolean; ttlMs: number }> {
  await connectDB();
  const grant = await LectureAccess.findOne({
    code,
    contentId,
    source: "secret",
    isActive: true,
  })
    .select("secretKeyHash startAt endAt gateTtlHours")
    .lean();
  if (!grant || !grant.secretKeyHash) return { ok: false, ttlMs: 0 };
  if (!withinPeriod(grant.startAt, grant.endAt)) return { ok: false, ttlMs: 0 };

  const provided = Buffer.from(hashKey(key));
  const stored = Buffer.from(grant.secretKeyHash);
  const ok =
    provided.length === stored.length && timingSafeEqual(provided, stored);
  if (!ok) return { ok: false, ttlMs: 0 };

  // 재입력 주기(쿠키 TTL): 설정값(시간) 기본 24h, 단 종료일이 있으면 그보다 길 수 없음
  const hours = grant.gateTtlHours && grant.gateTtlHours > 0 ? grant.gateTtlHours : 24;
  let ttlMs = hours * 60 * 60 * 1000;
  if (grant.endAt) {
    ttlMs = Math.min(ttlMs, Math.max(0, new Date(grant.endAt).getTime() - Date.now()));
  }
  return { ok: ttlMs > 0, ttlMs };
}

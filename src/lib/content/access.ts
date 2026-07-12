import connectDB from "@/lib/db/mongodb";
import {
  Subscription,
  ProgramPermission,
  UserPermission,
} from "@/lib/db/models";

/**
 * 사용자가 현재 보유한 접근 가능한 permissionTypeId 집합(문자열).
 * 활성 구독 → 프로그램 권한 + 직접 부여(UserPermission)를 합산.
 */
export async function getAccessiblePermissionTypeIds(
  userId: string,
): Promise<Set<string>> {
  await connectDB();
  const now = new Date();
  const ids = new Set<string>();

  // 1) 활성 구독 → 프로그램 → 권한
  const subs = await Subscription.find({ userId, status: "active" })
    .select("programId endAt")
    .lean();
  const activeProgramIds = subs
    .filter((s) => s.endAt && new Date(s.endAt) > now)
    .map((s) => s.programId)
    .filter(Boolean);
  if (activeProgramIds.length) {
    const pp = await ProgramPermission.find({
      programId: { $in: activeProgramIds },
    })
      .select("permissionTypeId")
      .lean();
    pp.forEach((p) => ids.add(String(p.permissionTypeId)));
  }

  // 2) 직접 부여(UserPermission)
  const ups = await UserPermission.find({ userId })
    .select("permissionTypeId startAt endAt")
    .lean();
  ups.forEach((u) => {
    const okStart = !u.startAt || new Date(u.startAt) <= now;
    const okEnd = !u.endAt || new Date(u.endAt) > now;
    if (okStart && okEnd) ids.add(String(u.permissionTypeId));
  });

  return ids;
}

/** 회원 쿠키(klead_member) 파싱 — 인코딩 횟수 무관 */
export function parseMemberCookie(raw?: string): { id: string } | null {
  if (!raw) return null;
  let v = raw;
  for (let i = 0; i < 3; i++) {
    try {
      return JSON.parse(v);
    } catch {
      try {
        v = decodeURIComponent(v);
      } catch {
        break;
      }
    }
  }
  return null;
}

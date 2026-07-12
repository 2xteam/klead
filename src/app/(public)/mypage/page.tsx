import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import {
  User,
  Subscription,
  ProgramPermission,
  ContentPermission,
  Content,
} from "@/lib/db/models";
import type { Types } from "mongoose";

export const dynamic = "force-dynamic";
export const metadata = { title: "마이페이지 | 클리드" };

const CATEGORY_LABEL: Record<string, string> = {
  waxing: "왁싱",
  eyebrow: "눈썹",
  scalp: "두피관리",
  face_design: "페이스디자인",
  skin_care: "피부관리",
  body_care: "바디관리",
  theory: "이론",
  business: "경영",
};

function parseMember(raw?: string): { id: string; name: string } | null {
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

function fmt(d?: Date) {
  return d ? new Date(d).toISOString().slice(0, 10) : "-";
}
function daysLeft(end?: Date) {
  if (!end) return null;
  const ms =
    new Date(end).getTime() - new Date("2026-07-11T00:00:00Z").getTime();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export default async function MyPage() {
  const store = await cookies();
  const member = parseMember(store.get("klead_member")?.value);
  if (!member) redirect("/login");

  await connectDB();
  const user = await User.findById(member.id)
    .select("name email role status createdAt")
    .lean();
  if (!user) redirect("/login");

  const subsRaw = await Subscription.find({ userId: user._id })
    .populate("programId", "name code")
    .sort({ createdAt: -1 })
    .lean();

  const now = new Date("2026-07-11T00:00:00Z");
  type Sub = {
    programName: string;
    status: string;
    startAt?: Date;
    endAt?: Date;
    autoRenew?: boolean;
    active: boolean;
  };
  const subs: Sub[] = subsRaw.map((s) => {
    const prog = s.programId as unknown as { name?: string } | null;
    return {
      programName: prog?.name ?? "-",
      status: s.status,
      startAt: s.startAt,
      endAt: s.endAt,
      autoRenew: s.autoRenew,
      active: s.status === "active" && !!s.endAt && new Date(s.endAt) > now,
    };
  });
  const activeSubs = subs.filter((s) => s.active);

  // 접근 가능한 강의: 활성 구독 → 프로그램 권한 → 콘텐츠 권한 → 강의
  const activeProgramIds = subsRaw
    .filter((s) => s.status === "active" && s.endAt && new Date(s.endAt) > now)
    .map((s) => (s.programId as unknown as { _id: Types.ObjectId })?._id)
    .filter(Boolean);

  let lectures: { slug: string; title: string; category?: string }[] = [];
  if (activeProgramIds.length) {
    const progPerms = await ProgramPermission.find({
      programId: { $in: activeProgramIds },
    })
      .select("permissionTypeId")
      .lean();
    const permTypeIds = progPerms.map((p) => p.permissionTypeId);
    const contentPerms = await ContentPermission.find({
      permissionTypeId: { $in: permTypeIds },
    })
      .select("contentId")
      .lean();
    const contentIds = [
      ...new Set(contentPerms.map((c) => String(c.contentId))),
    ];
    const docs = await Content.find({
      _id: { $in: contentIds },
      type: "lecture",
      deletedAt: null,
    })
      .select("slug title lectureCategory")
      .lean();
    lectures = docs.map((d) => ({
      slug: d.slug,
      title: d.title,
      category: d.lectureCategory
        ? (CATEGORY_LABEL[d.lectureCategory] ?? d.lectureCategory)
        : undefined,
    }));
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-14 lg:px-6">
      <h1 className="text-[26px] font-bold">{user.name}님의 마이페이지</h1>
      <p className="mt-1 text-[14px] text-klead-gray-500">
        회원권 상태와 수강 가능한 강의를 확인하세요.
      </p>

      <section className="mt-8">
        <h2 className="mb-4 text-[18px] font-bold">회원권 상태</h2>
        {activeSubs.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {activeSubs.map((s, i) => (
              <div
                key={i}
                className="rounded-xl border border-black/10 bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-bold">
                    {s.programName}
                  </span>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[12px] font-medium text-green-700">
                    이용중
                  </span>
                </div>
                <p className="mt-3 text-[14px] text-klead-gray-500">
                  이용 기간: {fmt(s.startAt)} ~ {fmt(s.endAt)}
                </p>
                <p className="mt-1 text-[14px]">
                  남은 기간{" "}
                  <span className="text-[18px] font-bold text-klead-primary">
                    D-{daysLeft(s.endAt)}
                  </span>
                </p>
                <p className="mt-1 text-[12px] text-klead-gray-400">
                  자동 갱신 {s.autoRenew ? "ON" : "OFF"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-black/10 bg-[#fafafa] p-8 text-center">
            <p className="text-[15px] text-klead-gray-500">
              현재 이용 중인 회원권이 없습니다.
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-block rounded-full bg-black px-6 py-2.5 text-[14px] font-semibold text-white"
            >
              강의 둘러보기
            </Link>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-[18px] font-bold">
          나의 강의{" "}
          <span className="text-klead-gray-400">({lectures.length})</span>
        </h2>
        {lectures.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lectures.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/lecture/${l.slug}`}
                  className="block rounded-lg border border-black/10 bg-white p-5 transition hover:shadow-md"
                >
                  {l.category && (
                    <p className="mb-1 text-[12px] text-klead-primary">
                      {l.category}
                    </p>
                  )}
                  <p className="text-[15px] font-bold">{l.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-black/10 bg-[#fafafa] p-8 text-center text-[14px] text-klead-gray-500">
            수강 가능한 강의가 없습니다. 회원권을 구독하면 강의가 표시됩니다.
          </p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-[18px] font-bold">구독 이력</h2>
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
          <table className="w-full text-left text-[14px]">
            <thead className="border-b border-black/10 bg-[#fafafa] text-[12px] uppercase text-klead-gray-500">
              <tr>
                <th className="px-4 py-3 font-semibold">프로그램</th>
                <th className="px-4 py-3 font-semibold">상태</th>
                <th className="px-4 py-3 font-semibold">기간</th>
                <th className="px-4 py-3 font-semibold">자동갱신</th>
              </tr>
            </thead>
            <tbody>
              {subs.length ? (
                subs.map((s, i) => (
                  <tr key={i} className="border-b border-black/5 last:border-0">
                    <td className="px-4 py-3 font-medium">{s.programName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          s.active ? "text-green-700" : "text-klead-gray-400"
                        }
                      >
                        {s.active ? "이용중" : s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-klead-gray-500">
                      {fmt(s.startAt)} ~ {fmt(s.endAt)}
                    </td>
                    <td className="px-4 py-3 text-klead-gray-500">
                      {s.autoRenew ? "ON" : "OFF"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-klead-gray-400"
                  >
                    구독 이력이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

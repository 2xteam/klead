import connectDB from "@/lib/db/mongodb";
import { LectureAccess, Content, User } from "@/lib/db/models";
import {
  AccessGrantForm,
  type LectureOption,
  type MemberOption,
} from "@/components/admin/access-grant-form";
import {
  AccessGrantList,
  type AccessGrantItem,
} from "@/components/admin/access-grant-list";

export const dynamic = "force-dynamic";

export default async function AdminAccessPage() {
  await connectDB();

  const [lectureDocs, memberDocs, grantDocs] = await Promise.all([
    Content.find({ type: "lecture", deletedAt: null })
      .select("title slug")
      .sort({ title: 1 })
      .lean(),
    User.find({}).select("name email").sort({ name: 1 }).limit(500).lean(),
    LectureAccess.find({})
      .populate("contentId", "title slug")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const lectures: LectureOption[] = lectureDocs.map((d) => ({
    id: String(d._id),
    title: d.title,
    slug: d.slug,
  }));
  const members: MemberOption[] = memberDocs.map((d) => ({
    id: String(d._id),
    name: d.name ?? "(이름없음)",
    email: d.email ?? "",
  }));
  const items: AccessGrantItem[] = grantDocs.map((d) => {
    const c = d.contentId as unknown as {
      title?: string;
      slug?: string;
    } | null;
    const u = d.userId as unknown as { name?: string } | null;
    return {
      _id: String(d._id),
      lectureTitle: c?.title ?? "(삭제된 강의)",
      lectureSlug: c?.slug ?? "",
      userName: u?.name ?? null,
      source: d.source,
      code: d.code,
      hasSecret: !!d.secretKeyHash,
      secretKey: d.secretKey ?? null,
      gateTtlHours: d.gateTtlHours ?? 24,
      startAt: d.startAt ? new Date(d.startAt).toISOString() : null,
      endAt: d.endAt ? new Date(d.endAt).toISOString() : null,
      note: d.note ?? "",
      isActive: d.isActive,
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold">강의 열람권 이벤트</h1>
        <p className="mt-1 text-[13px] text-klead-gray-500">
          강의별로 회원에게 열람권을 부여하거나, 시크릿 키로 URL 임시 열람권을
          발급합니다. 총 {items.length}건
        </p>
      </div>

      <div className="mb-6 space-y-2 rounded-lg border border-klead-primary/20 bg-klead-primary/5 p-4 text-[13px] leading-relaxed text-klead-gray-700">
        <p className="font-semibold text-klead-gray-900">동작 방식</p>
        <p>
          · <b>회원 지정</b>: 지정한 회원이 로그인 상태에서 기간 내 자동으로 강의를
          열람합니다(구독/등급권한이 없어도 허용).
        </p>
        <p>
          · <b>시크릿 키</b>: 발급된 <b>공유 URL</b>과 <b>시크릿 키</b>를 함께 전달하면,
          비회원도 URL 접속 후 키 입력에 성공하면 열람할 수 있습니다.
        </p>
        <p>
          · <b>재입력 주기</b>: 키 입력에 성공하면 설정한 시간(기본 24시간) 동안
          <b> 재입력 없이</b> 열람됩니다(브라우저 서명 쿠키). 이 시간이 지나면
          다시 키를 입력해야 합니다.
        </p>
        <p>
          · <b>만료</b>: <b>종료일</b>이 지나면 열람이 차단되며, 재입력 유지 시간도
          종료일을 넘지 않습니다. 종료일이 없으면 재입력 주기마다 갱신되어 무기한
          유지됩니다.
        </p>
        <p className="text-klead-gray-500">
          시크릿 키는 해시로 저장되어 검증에만 쓰이며, 관리자 목록에는 공유 편의를
          위해 원문이 표시됩니다.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <AccessGrantForm lectures={lectures} members={members} />
        <AccessGrantList items={items} />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db/mongodb";
import { Content } from "@/lib/db/models";
import type { IPageSection } from "@/lib/db/models/content";
import { SectionRenderer } from "@/components/content/section-renderer";
import { SecretGate } from "@/components/content/secret-gate";
import {
  getAccessiblePermissionTypeIds,
  parseMemberCookie,
} from "@/lib/content/access";
import {
  hasMemberLectureAccess,
  verifyGateToken,
  gateCookieName,
} from "@/lib/content/lecture-access";

export const dynamic = "force-dynamic";

async function getLecture(slug: string) {
  await connectDB();
  return Content.findOne({
    slug,
    type: "lecture",
    isPublic: true,
    "publish.status": "published",
    deletedAt: null,
  }).lean();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getLecture(slug);
  return { title: doc ? `${doc.title} | 강의 | 클리드` : "강의 | 클리드" };
}

export default async function LecturePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ access?: string }>;
}) {
  const { slug } = await params;
  const { access: accessCode } = await searchParams;
  const doc = await getLecture(slug);
  if (!doc) notFound();

  const contentId = String(doc._id);
  const permId = doc.permissionTypeId ? String(doc.permissionTypeId) : null;

  // 열람 가능 판정
  let allowed = !permId; // 권한 미지정 강의는 공개
  const store = await cookies();
  const member = parseMemberCookie(store.get("klead_member")?.value);

  if (!allowed && member) {
    // 1) 등급 권한(구독/부여)
    const accessible = await getAccessiblePermissionTypeIds(member.id);
    if (permId && accessible.has(permId)) allowed = true;
    // 2) 회원 귀속 열람권
    if (!allowed && (await hasMemberLectureAccess(member.id, contentId)))
      allowed = true;
  }

  // 3) 시크릿 서명 쿠키(키 통과 이력)
  if (!allowed) {
    const token = store.get(gateCookieName(contentId))?.value;
    if (verifyGateToken(token, contentId)) allowed = true;
  }

  // 미허용: 시크릿 코드 파라미터가 있으면 키 입력 팝업, 아니면 접근 거부 안내
  if (!allowed) {
    if (accessCode) {
      return <SecretGate slug={slug} code={accessCode} />;
    }
    return (
      <div className="bg-[#0e0e0e] text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-[720px] flex-col items-center justify-center px-4 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="4" y="10" width="16" height="10" rx="2" stroke="white" strokeWidth="1.6" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="white" strokeWidth="1.6" />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold">열람 권한이 없습니다</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-white/70">
            이 강의는 구독(회원권) 또는 열람권이 필요합니다.
            <br />
            구독 프로그램을 신청하거나 강의를 구매해 주세요.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href={`/courses/${slug}`}
              className="rounded-full bg-white px-6 py-2.5 text-[14px] font-bold text-black transition hover:bg-white/90"
            >
              강의 상품 보기
            </Link>
            <Link
              href="/courses"
              className="rounded-full border border-white/30 px-6 py-2.5 text-[14px] font-semibold text-white transition hover:bg-white/10"
            >
              강의 종목으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const learn = JSON.parse(
    JSON.stringify(doc.learnSections ?? []),
  ) as IPageSection[];

  return (
    <div className="bg-[#0e0e0e] text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-24 lg:px-6 lg:py-28">
        <p className="mb-3 text-[13px] tracking-widest text-klead-primary">
          LECTURE
        </p>
        <h1 className="text-[26px] font-bold sm:text-[34px]">{doc.title}</h1>
        {doc.summary && (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/70">
            {doc.summary}
          </p>
        )}
        <Link
          href={`/courses/${slug}`}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-white/10"
        >
          강의 상품 정보 보기
        </Link>
      </div>

      {learn.length > 0 ? (
        <SectionRenderer sections={learn} />
      ) : (
        <div className="mx-auto max-w-[1280px] px-4 py-24 lg:px-6 lg:py-28">
          <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-[16px] font-semibold">
              강의 콘텐츠가 곧 공개됩니다.
            </p>
            <p className="mt-2 text-[14px] text-white/60">
              커리큘럼과 강의 영상이 준비 중입니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

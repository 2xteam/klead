import connectDB from "@/lib/db/mongodb";
import { User } from "@/lib/db/models";
import { LoginDemo, type DemoMember } from "@/components/auth/login-demo";

export const dynamic = "force-dynamic";

export const metadata = { title: "로그인 | 클리드" };

// 이름 기반 회원 설명(데모용)
const DESC: Record<string, string> = {
  관리자: "관리자 콘솔 접근 · 전체 관리 권한",
  베이직회원: "Basic 프로그램 구독 · 입문 강의 열람",
  프리미엄회원: "Premium 프로그램 구독 · 대부분 강의 열람",
  마스터회원: "Master 프로그램 구독 · 전체 강의 열람",
  왁싱전용회원: "왁싱 권한만 보유",
  두피전용회원: "두피관리 권한만 보유",
  미구독회원: "구독 없음 · 공개 콘텐츠만 열람",
};

export default async function LoginPage() {
  await connectDB();
  const docs = await User.find({ authProvider: "test" })
    .select("name role status")
    .sort({ role: -1, createdAt: 1 })
    .lean();

  const members: DemoMember[] = docs.map((u) => ({
    id: String(u._id),
    name: u.name,
    role: u.role,
    status: u.status,
    description:
      DESC[u.name] ??
      (u.role === "admin" ? "관리자" : "일반 회원 · 구매/수강 회원"),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:py-20">
      <div className="mb-8 text-center">
        <h1 className="text-[28px] font-bold">로그인</h1>
        <p className="mt-2 text-[15px] text-klead-gray-500">
          카카오 로그인은 2차 개발에서 제공됩니다.
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-5 py-3 text-[13px] leading-relaxed text-amber-700">
        ⚠ <b>개발용 임시 로그인</b> — 회원 등급/권한별로 화면이 어떻게 보이는지
        시연하기 위한 임시 기능입니다. 아래 테스트 회원을 선택하면 해당 회원으로
        로그인됩니다. (실서비스에서는 제거됩니다)
      </div>

      <LoginDemo members={members} />
    </div>
  );
}

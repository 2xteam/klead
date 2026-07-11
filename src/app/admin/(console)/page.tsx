import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import {
  User,
  Content,
  QnA,
  Faq,
  Program,
  Menu,
  Popup,
} from "@/lib/db/models";

export const dynamic = "force-dynamic";

async function getStats() {
  await connectDB();
  const [
    members,
    lectures,
    posts,
    qnaPending,
    faqs,
    programs,
    menus,
    popupsActive,
  ] = await Promise.all([
    User.countDocuments({ status: { $ne: "withdrawn" } }),
    Content.countDocuments({ type: "lecture", deletedAt: null }),
    Content.countDocuments({ type: "content", deletedAt: null }),
    QnA.countDocuments({ status: "pending" }),
    Faq.countDocuments({}),
    Program.countDocuments({}),
    Menu.countDocuments({}),
    Popup.countDocuments({ isActive: true }),
  ]);
  return {
    members,
    lectures,
    posts,
    qnaPending,
    faqs,
    programs,
    menus,
    popupsActive,
  };
}

const cards = [
  { key: "members", label: "회원", href: "/admin/members" },
  { key: "lectures", label: "강의", href: "/admin/classes" },
  { key: "posts", label: "게시글", href: "/admin/posts" },
  { key: "qnaPending", label: "미답변 Q&A", href: "/admin/qna", accent: true },
  { key: "faqs", label: "FAQ", href: "/admin/faqs" },
  { key: "programs", label: "프로그램", href: "/admin/programs" },
  { key: "menus", label: "메뉴", href: "/admin/menus" },
  { key: "popupsActive", label: "활성 팝업", href: "/admin/popups" },
] as const;

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold">대시보드</h1>
        <p className="mt-1 text-[13px] text-klead-gray-500">
          클리드 관리자 콘솔 · 콘텐츠/운영 현황 요약
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.key}
            href={c.href}
            className="rounded-lg border border-black/10 bg-white p-6 transition-shadow hover:shadow-sm"
          >
            <p className="mb-2 text-[13px] text-klead-gray-500">{c.label}</p>
            <p
              className={
                "accent" in c && c.accent && stats[c.key] > 0
                  ? "text-[30px] font-bold text-klead-primary"
                  : "text-[30px] font-bold"
              }
            >
              {stats[c.key]}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-black/10 bg-white p-6">
        <h2 className="mb-3 text-[15px] font-bold">빠른 작업</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "새 게시글", href: "/admin/posts/new" },
            { label: "새 FAQ", href: "/admin/faqs/new" },
            { label: "새 팝업", href: "/admin/popups/new" },
            { label: "새 메뉴", href: "/admin/menus/new" },
            { label: "SiteSettings", href: "/admin/settings" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-md border border-black/10 px-4 py-2 text-[13px] font-medium hover:bg-[#f4f4f5]"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/logout-button";

const navGroups = [
  {
    label: "대시보드",
    items: [{ label: "통계", href: "/admin", ready: true }],
  },
  {
    label: "콘텐츠",
    items: [
      { label: "강의 관리", href: "/admin/classes", ready: true },
      { label: "리뷰 관리", href: "/admin/reviews", ready: true },
      { label: "테크 큐레이터", href: "/admin/curators", ready: true },
      { label: "게시글 관리", href: "/admin/posts", ready: true },
      { label: "메뉴 관리", href: "/admin/menus", ready: true },
      { label: "FAQ", href: "/admin/faqs", ready: true },
      { label: "Q&A", href: "/admin/qna", ready: true },
      { label: "팝업", href: "/admin/popups", ready: true },
      { label: "인스타그램", href: "/admin/instagram", ready: true },
    ],
  },
  {
    label: "운영",
    items: [
      { label: "회원 관리", href: "/admin/members", ready: true },
      { label: "프로그램·권한", href: "/admin/programs", ready: true },
      { label: "SiteSettings", href: "/admin/settings", ready: true },
    ],
  },
];

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f4f4f5] text-klead-gray-900">
      <aside className="w-60 shrink-0 border-r border-black/10 bg-white">
        <div className="flex h-16 items-center border-b border-black/10 px-6">
          <Link href="/admin" className="text-[18px] font-bold">
            KLEAD <span className="text-klead-primary">Admin</span>
          </Link>
        </div>
        <nav className="space-y-6 p-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-klead-gray-500">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    {item.ready ? (
                      <Link
                        href={item.href}
                        className="block rounded-md px-3 py-2 text-[14px] font-medium hover:bg-[#f4f4f5]"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="flex items-center justify-between rounded-md px-3 py-2 text-[14px] text-klead-gray-400">
                        {item.label}
                        <span className="text-[10px]">준비중</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-black/10 bg-white px-8">
          <span className="text-[14px] text-klead-gray-500">관리자 콘솔</span>
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="text-[13px] font-medium text-klead-primary hover:underline"
            >
              사이트 보기 ↗
            </Link>
            <AdminLogoutButton />
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

import Link from "next/link";

export interface CuratorTab {
  slug: string; // 라우트 슬러그 ("curator-" 접두어 제거된 값)
  name: string;
}

/**
 * 큐레이터 상세 상단 탭 메뉴 (klead sub_menu 위젯 클론).
 * 활성 탭은 진한 배경, 나머지는 흰 배경 + 보라 텍스트.
 */
export function CuratorTabs({
  tabs,
  activeSlug,
}: {
  tabs: CuratorTab[];
  activeSlug: string;
}) {
  if (tabs.length < 2) return null;
  return (
    <div className="bg-black">
      <div className="mx-auto max-w-[1280px] px-4 pb-6 pt-28 lg:px-6">
        <ul className="grid grid-cols-3 overflow-hidden rounded-md border border-black/10 sm:grid-cols-4 lg:grid-cols-7">
          {tabs.map((t) => {
            const active = t.slug === activeSlug;
            return (
              <li key={t.slug} className="border-b border-r border-black/10">
                <Link
                  href={`/curators/${t.slug}`}
                  className={
                    "block px-4 py-3.5 text-center text-[15px] font-semibold transition " +
                    (active
                      ? "bg-klead-gray-800 text-white"
                      : "bg-white text-klead-primary hover:bg-black/5")
                  }
                >
                  {t.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

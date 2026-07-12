import connectDB from "@/lib/db/mongodb";
import { Banner } from "@/lib/db/models";
import type { IPageSection } from "@/lib/db/models/content";

/**
 * banner 타입 섹션의 bannerId를 실제 Banner 데이터로 치환한다.
 * (배너 관리에서 배너를 수정하면 이를 참조하는 모든 콘텐츠에 반영)
 */
export async function hydrateBannerSections(
  sections: IPageSection[],
): Promise<IPageSection[]> {
  const ids = [
    ...new Set(
      sections
        .filter((s) => s.type === "banner" && s.bannerId)
        .map((s) => s.bannerId as string),
    ),
  ];
  if (!ids.length) return sections;

  await connectDB();
  const banners = await Banner.find({ _id: { $in: ids } }).lean();
  const map = new Map(banners.map((b) => [String(b._id), b]));

  return sections.map((s) => {
    if (s.type !== "banner" || !s.bannerId) return s;
    const b = map.get(s.bannerId);
    if (!b || b.isActive === false) return s;
    return {
      ...s,
      subtitle: b.subtitle || s.subtitle,
      title: b.title || s.title,
      backgroundImage: b.backgroundImage || s.backgroundImage,
      items: (b.logos ?? []).map((imageUrl, i) => ({ imageUrl, sortOrder: i })),
    };
  });
}

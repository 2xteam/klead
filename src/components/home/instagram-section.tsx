import connectDB from "@/lib/db/mongodb";
import { InstagramPost } from "@/lib/db/models";
import { InstagramGallery } from "@/components/home/instagram-gallery";

/**
 * 인스타그램 피드 갤러리 (klead.kr container_w20260203d432bcf3a2f03 클론).
 * 데이터는 DB(InstagramPost)에서 관리. 3열 그리드 · 9개씩 노출 후 더보기.
 */
export const dynamic = "force-dynamic";

export async function InstagramSection() {
  await connectDB();
  const docs = await InstagramPost.find({ isActive: true })
    .sort({ sortOrder: 1 })
    .lean();

  const posts = docs.map((d) => ({
    image: d.image,
    href: d.link ?? "",
    caption: d.caption ?? "",
  }));

  if (!posts.length) return null;

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
        <InstagramGallery posts={posts} />
      </div>
    </section>
  );
}

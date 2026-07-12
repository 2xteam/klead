import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Banner } from "@/lib/db/models";
import { BannerEditor, type BannerFormData } from "@/components/admin/banner-editor";

export const dynamic = "force-dynamic";

const EMPTY: BannerFormData = {
  name: "",
  subtitle: "",
  title: "",
  backgroundImage: "",
  logos: [],
  isActive: true,
};

export default async function AdminBannerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let initial: BannerFormData = EMPTY;
  if (!isNew) {
    await connectDB();
    const doc = await Banner.findById(id).lean();
    if (!doc) notFound();
    initial = {
      name: doc.name ?? "",
      subtitle: doc.subtitle ?? "",
      title: doc.title ?? "",
      backgroundImage: doc.backgroundImage ?? "",
      logos: doc.logos ?? [],
      isActive: doc.isActive ?? true,
    };
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/banners"
          className="text-[13px] text-klead-gray-500 hover:underline"
        >
          ← 배너 목록
        </Link>
        <h1 className="mt-2 text-[22px] font-bold">
          {isNew ? "새 배너" : "배너 수정"}
        </h1>
      </div>
      <BannerEditor id={isNew ? null : id} initial={initial} />
    </div>
  );
}

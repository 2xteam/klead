import { notFound } from "next/navigation";
import Link from "next/link";
import connectDB from "@/lib/db/mongodb";
import { Popup } from "@/lib/db/models";
import { PopupEditor, type PopupFormData } from "@/components/admin/popup-editor";

export const dynamic = "force-dynamic";

/** Date → "YYYY-MM-DDTHH:mm" (datetime-local 입력용) */
function toInput(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 16);
}

const EMPTY: PopupFormData = {
  title: "",
  body: "",
  imageUrl: "",
  linkUrl: "",
  linkTarget: "_self",
  startDt: "",
  endDt: "",
  showOnce: true,
  pages: [],
  sortOrder: 0,
  isActive: true,
};

export default async function AdminPopupEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let initial: PopupFormData = EMPTY;

  if (!isNew) {
    await connectDB();
    const doc = await Popup.findById(id).lean();
    if (!doc) notFound();
    initial = {
      title: doc.title,
      body: doc.body ?? "",
      imageUrl: doc.imageUrl ?? "",
      linkUrl: doc.linkUrl ?? "",
      linkTarget: doc.linkTarget ?? "_self",
      startDt: toInput(doc.display?.startDt),
      endDt: toInput(doc.display?.endDt),
      showOnce: doc.display?.showOnce ?? true,
      pages: doc.display?.pages ?? [],
      sortOrder: doc.sortOrder ?? 0,
      isActive: doc.isActive ?? true,
    };
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/popups"
          className="text-[13px] text-klead-gray-500 hover:underline"
        >
          ← 팝업 목록
        </Link>
        <h1 className="mt-2 text-[22px] font-bold">
          {isNew ? "새 팝업" : "팝업 수정"}
        </h1>
      </div>
      <PopupEditor id={isNew ? null : id} initial={initial} />
    </div>
  );
}

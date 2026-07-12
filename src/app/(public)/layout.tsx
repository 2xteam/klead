import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import connectDB from "@/lib/db/mongodb";
import { Menu } from "@/lib/db/models";
import type { NavItem } from "@/config/site";

export const dynamic = "force-dynamic";

function toHref(m: {
  linkType?: string;
  path?: string | null;
  externalUrl?: string | null;
}): string {
  if (m.linkType === "external") return m.externalUrl ?? "#";
  return m.path ?? "#";
}

/** 공개 헤더 내비게이션을 Menu CMS(/admin/menus)에서 구성 — 단일 소스 */
async function getNav(): Promise<NavItem[]> {
  await connectDB();
  const docs = await Menu.find({ isVisible: true })
    .sort({ sortOrder: 1 })
    .lean();
  const top = docs.filter((d) => !d.parentId);
  return top.map((t) => {
    const children = docs
      .filter((d) => d.parentId && String(d.parentId) === String(t._id))
      .map((c) => ({ label: c.name, href: toHref(c) }));
    const item: NavItem = { label: t.name, href: toHref(t) };
    if (children.length) item.children = children;
    return item;
  });
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = await getNav();
  return (
    <>
      <Header nav={nav} />
      <main className="min-h-[60vh] flex-1">{children}</main>
      <Footer />
    </>
  );
}

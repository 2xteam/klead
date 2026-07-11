export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-[800px] px-4 py-20 text-center lg:px-6">
      <h1 className="mb-4 text-[28px] font-bold">{title}</h1>
      <p className="text-[16px] leading-relaxed text-klead-gray-500">
        {description ?? "콘텐츠 준비 중입니다. Phase 1에서 CMS 연동 예정입니다."}
      </p>
    </div>
  );
}

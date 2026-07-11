import Image from "next/image";
import type { IPageSection } from "@/lib/db/models/content";

function SectionHero({ section }: { section: IPageSection }) {
  return (
    <section className="relative overflow-hidden bg-[#0e0e0e] text-white">
      {section.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${section.backgroundImage})` }}
        />
      )}
      <div className="relative mx-auto max-w-[1280px] px-4 py-24 lg:px-6 lg:py-32">
        <p className="mb-4 text-[14px] tracking-widest text-[#a9a9a9]">
          {section.title}
        </p>
        <h1 className="mb-6 whitespace-pre-line text-[28px] font-bold leading-snug sm:text-[36px]">
          {section.subtitle}
        </h1>
        <p className="whitespace-pre-line text-[16px] leading-relaxed text-[#d4d4d4]">
          {section.body}
        </p>
      </div>
    </section>
  );
}

function SectionValues({ section }: { section: IPageSection }) {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1280px] px-4 py-16 lg:px-6 lg:py-24">
        <h2 className="mb-4 text-[22px] font-bold sm:text-[28px]">
          {section.title}
        </h2>
        <p className="mb-12 max-w-3xl whitespace-pre-line text-[15px] leading-relaxed text-klead-gray-500">
          {section.body}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {section.items?.map((item) => (
            <div
              key={item.title}
              className="min-h-[220px] bg-black p-6 text-white"
            >
              {item.iconUrl && (
                <Image
                  src={item.iconUrl}
                  alt=""
                  width={40}
                  height={40}
                  className="mb-4 h-8 w-auto"
                />
              )}
              <h3 className="mb-3 text-[18px] font-bold">{item.title}</h3>
              <p className="text-[14px] leading-relaxed text-[#dedede]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionLeaders({ section }: { section: IPageSection }) {
  return (
    <section className="bg-[#f7f7f7]">
      <div className="mx-auto max-w-[1280px] px-4 py-16 lg:px-6 lg:py-24">
        <h2 className="mb-12 text-center text-[22px] font-bold sm:text-[28px]">
          {section.title}
        </h2>
        <div className="grid gap-12 lg:grid-cols-2">
          {section.items?.map((item) => (
            <article key={item.title} className="text-center lg:text-left">
              {item.imageUrl && (
                <div className="relative mx-auto mb-6 aspect-[3/4] max-w-[320px] overflow-hidden bg-[#e7e7e7] lg:mx-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.title ?? ""}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                </div>
              )}
              <p className="mb-2 text-[14px] text-klead-gray-500">
                {item.subtitle}
              </p>
              <h3 className="mb-3 text-[22px] font-bold">{item.title}</h3>
              {item.bullets?.map((b) => (
                <p key={b} className="text-[14px] font-semibold leading-relaxed">
                  {b}
                </p>
              ))}
              <p className="mt-4 text-[14px] leading-relaxed text-klead-gray-500">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionCurriculum({ section }: { section: IPageSection }) {
  return (
    <section className="relative overflow-hidden bg-[#0e0e0e] text-white">
      {section.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${section.backgroundImage})` }}
        />
      )}
      <div className="relative mx-auto max-w-[1280px] px-4 py-16 lg:px-6 lg:py-24">
        <h2 className="mb-2 text-[22px] font-bold sm:text-[28px]">
          {section.title}
        </h2>
        <p className="mb-6 text-[22px] font-bold sm:text-[28px]">
          {section.subtitle}
        </p>
        <p className="mb-12 max-w-2xl whitespace-pre-line text-[16px] leading-relaxed text-[#dedede]">
          {section.body}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {section.items?.map((item) => (
            <div
              key={item.title}
              className="border border-white/20 bg-black/40 p-6 backdrop-blur-sm"
            >
              <h3 className="mb-4 text-center text-[18px] font-bold">
                {item.title}
              </h3>
              <hr className="mb-4 border-white/20" />
              <ul className="space-y-2 text-center text-[14px] text-[#dedede]">
                {item.bullets?.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionPartners({ section }: { section: IPageSection }) {
  return (
    <section className="bg-[#0e0e0e] text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-16 lg:px-6 lg:py-20">
        <p className="mb-3 text-center text-[14px] text-[#a9a9a9]">
          {section.subtitle}
        </p>
        <h2 className="mb-12 text-center text-[26px] font-bold sm:text-[30px]">
          {section.title}
        </h2>
        <div className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {section.items?.map((item) =>
            item.imageUrl ? (
              <div
                key={item.title}
                className="relative mx-auto flex h-16 w-full max-w-[140px] items-center justify-center"
              >
                <Image
                  src={item.imageUrl}
                  alt={item.title ?? "partner"}
                  width={140}
                  height={64}
                  className="h-auto max-h-16 w-auto object-contain"
                />
              </div>
            ) : null,
          )}
        </div>
      </div>
    </section>
  );
}

function SectionContact({ section }: { section: IPageSection }) {
  return (
    <section className="bg-[#0e0e0e] text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-16 lg:px-6 lg:py-20">
        <h2 className="mb-10 text-[28px] font-bold">{section.title}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {section.items?.map((item) => (
            <div key={item.title} className="bg-[#222222] p-6">
              <h3 className="mb-3 text-[20px] font-bold">{item.title}</h3>
              <p className="mb-4 text-[14px] text-[#838383]">{item.description}</p>
              {item.linkUrl && (
                <a
                  href={item.linkUrl}
                  target={item.linkUrl.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="text-[14px] font-semibold text-[#d4d4d4] transition-colors hover:text-white"
                >
                  {item.linkLabel ?? "바로가기"}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ExpertProgramView({
  title,
  sections,
}: {
  title: string;
  sections: IPageSection[];
}) {
  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <h1 className="sr-only">{title}</h1>
      {sorted.map((section) => {
        switch (section.key) {
          case "hero":
            return <SectionHero key={section.key} section={section} />;
          case "values":
            return <SectionValues key={section.key} section={section} />;
          case "leaders":
            return <SectionLeaders key={section.key} section={section} />;
          case "curriculum":
            return <SectionCurriculum key={section.key} section={section} />;
          case "partners":
            return <SectionPartners key={section.key} section={section} />;
          case "contact":
            return <SectionContact key={section.key} section={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

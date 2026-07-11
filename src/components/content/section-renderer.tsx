import Image from "next/image";
import type { IPageSection } from "@/lib/db/models/content";
import { Reveal } from "@/components/common/reveal";
import { PartnerSlider } from "@/components/common/partner-slider";

function themeCls(theme?: string) {
  return theme === "dark" ? "bg-[#0e0e0e] text-white" : "bg-white text-klead-gray-900";
}
const wrap = "mx-auto max-w-[1280px] px-4 lg:px-6";

function Hero({ s }: { s: IPageSection }) {
  return (
    <section className={`relative overflow-hidden ${themeCls(s.theme ?? "dark")}`}>
      {s.backgroundImage && (
        <Image
          src={s.backgroundImage}
          alt=""
          fill
          className="object-cover opacity-40"
          sizes="100vw"
        />
      )}
      <div className={`relative ${wrap} py-24 text-center lg:py-32`}>
        {s.subtitle && (
          <p className="mb-4 text-[14px] tracking-widest text-klead-primary">{s.subtitle}</p>
        )}
        <h2 className="whitespace-pre-line text-[28px] font-bold leading-snug sm:text-[38px]">
          {s.title}
        </h2>
        {s.body && (
          <p className="mx-auto mt-5 max-w-2xl whitespace-pre-line text-[15px] leading-relaxed opacity-80">
            {s.body}
          </p>
        )}
      </div>
    </section>
  );
}

function RichText({ s }: { s: IPageSection }) {
  return (
    <section className={themeCls(s.theme)}>
      <div className={`${wrap} py-16 lg:py-20`}>
        {s.title && <h2 className="mb-4 text-[22px] font-bold sm:text-[28px]">{s.title}</h2>}
        {s.subtitle && <p className="mb-6 text-[15px] text-klead-primary">{s.subtitle}</p>}
        {s.body && (
          <div
            className="prose-klead whitespace-pre-line text-[15px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: s.body }}
          />
        )}
      </div>
    </section>
  );
}

function FullImage({ s }: { s: IPageSection }) {
  if (!s.imageUrl) return null;
  return (
    <section className={themeCls(s.theme)}>
      <div className={`${wrap} py-8`}>
        <Image
          src={s.imageUrl}
          alt={s.title ?? ""}
          width={1200}
          height={800}
          className="h-auto w-full"
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
      </div>
    </section>
  );
}

function ImageText({ s }: { s: IPageSection }) {
  const right = s.imagePosition === "right";
  return (
    <section className={themeCls(s.theme)}>
      <div className={`${wrap} grid items-center gap-8 py-16 lg:grid-cols-2 lg:py-20`}>
        {s.imageUrl && (
          <div className={`relative aspect-[4/3] overflow-hidden rounded-lg bg-black/5 ${right ? "lg:order-2" : ""}`}>
            <Image src={s.imageUrl} alt={s.title ?? ""} fill className="object-cover" sizes="(max-width:1024px) 100vw, 600px" />
          </div>
        )}
        <div>
          {s.subtitle && <p className="mb-2 text-[14px] text-klead-primary">{s.subtitle}</p>}
          {s.title && <h2 className="mb-4 text-[22px] font-bold sm:text-[28px]">{s.title}</h2>}
          {s.body && (
            <div className="whitespace-pre-line text-[15px] leading-relaxed opacity-90">{s.body}</div>
          )}
          {s.items?.length ? (
            <ul className="mt-4 space-y-1 text-[14px] opacity-80">
              {s.items.map((it, i) => (
                <li key={i}>· {it.title}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Gallery({ s }: { s: IPageSection }) {
  const imgs = (s.items ?? []).filter((i) => i.imageUrl);
  if (!imgs.length) return null;
  return (
    <section className={themeCls(s.theme)}>
      <div className={`${wrap} py-16 lg:py-20`}>
        {s.title && <h2 className="mb-8 text-center text-[22px] font-bold sm:text-[28px]">{s.title}</h2>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {imgs.map((it, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-md bg-black/5">
              <Image src={it.imageUrl!} alt={it.title ?? ""} fill className="object-cover" sizes="300px" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cards({ s }: { s: IPageSection }) {
  return (
    <section className={themeCls(s.theme ?? "dark")}>
      <div className={`${wrap} py-16 lg:py-24`}>
        {s.title && <h2 className="mb-10 text-center text-[22px] font-bold sm:text-[28px]">{s.title}</h2>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {s.items?.map((it, i) => (
            <div key={i} className="min-h-[180px] rounded-lg bg-black p-6 text-white">
              {it.iconUrl && (
                <Image src={it.iconUrl} alt="" width={40} height={40} className="mb-4 h-8 w-auto" />
              )}
              <h3 className="mb-3 text-[18px] font-bold">{it.title}</h3>
              <p className="text-[14px] leading-relaxed text-[#dedede]">{it.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Steps({ s }: { s: IPageSection }) {
  return (
    <section className={themeCls(s.theme ?? "dark")}>
      <div className={`${wrap} py-16 lg:py-24`}>
        {s.title && <h2 className="mb-10 text-center text-[22px] font-bold sm:text-[28px]">{s.title}</h2>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {s.items?.map((it, i) => (
            <div key={i} className="rounded-2xl border border-white/15 bg-black/40 p-6">
              <p className="mb-2 text-center text-[13px] text-klead-primary">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mb-4 whitespace-pre-line text-center text-[18px] font-bold text-white">
                {it.title}
              </h3>
              <ul className="space-y-1.5 text-[13px] text-[#cfcfcf]">
                {it.bullets?.map((b, bi) => (
                  <li key={bi} className="flex gap-1.5">
                    <span className="text-klead-primary">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProfileHeader({ s }: { s: IPageSection }) {
  return (
    <section className={`relative overflow-hidden ${themeCls(s.theme ?? "dark")}`}>
      {s.backgroundImage && (
        <Image src={s.backgroundImage} alt="" fill className="object-cover opacity-25" sizes="100vw" />
      )}
      <div className={`relative ${wrap} flex flex-col items-center gap-8 py-20 lg:flex-row lg:items-end lg:py-28`}>
        {s.imageUrl && (
          <div className="relative aspect-[3/4] w-56 shrink-0 overflow-hidden rounded-xl bg-black/20">
            <Image src={s.imageUrl} alt={s.title ?? ""} fill className="object-cover" sizes="224px" />
          </div>
        )}
        <div className="text-center lg:text-left">
          {s.subtitle && <p className="mb-2 text-[14px] tracking-widest text-klead-primary">{s.subtitle}</p>}
          <h1 className="mb-3 text-[30px] font-bold sm:text-[40px]">{s.title}</h1>
          {s.body && <p className="max-w-xl whitespace-pre-line text-[15px] leading-relaxed opacity-85">{s.body}</p>}
        </div>
      </div>
    </section>
  );
}

function Partners({ s }: { s: IPageSection }) {
  const logos = (s.items ?? [])
    .filter((i) => i.imageUrl)
    .map((i) => ({ imageUrl: i.imageUrl!, alt: i.title ?? "partner" }));
  return (
    <section className={themeCls(s.theme ?? "dark")}>
      <div className={`${wrap} py-16 lg:py-20`}>
        {s.title && <h2 className="mb-10 text-center text-[24px] font-bold sm:text-[28px]">{s.title}</h2>}
        {logos.length > 0 && <PartnerSlider items={logos} />}
      </div>
    </section>
  );
}

function Contact({ s }: { s: IPageSection }) {
  return (
    <section className={themeCls(s.theme ?? "dark")}>
      <div className={`${wrap} py-16 lg:py-20`}>
        <h2 className="mb-10 text-[28px] font-bold">{s.title ?? "Contact us."}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {s.items?.map((it, i) => (
            <div key={i} className="rounded-lg bg-[#222] p-6">
              <h3 className="mb-3 text-[18px] font-bold">{it.title}</h3>
              <p className="mb-4 text-[14px] text-[#838383]">{it.description}</p>
              {it.linkUrl && (
                <a
                  href={it.linkUrl}
                  target={it.linkUrl.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="text-[14px] font-semibold text-[#d4d4d4] hover:text-white"
                >
                  {it.linkLabel ?? "바로가기"}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function One({ s }: { s: IPageSection }) {
  switch (s.type) {
    case "hero":
      return <Hero s={s} />;
    case "image":
      return <FullImage s={s} />;
    case "imageText":
      return <ImageText s={s} />;
    case "gallery":
      return <Gallery s={s} />;
    case "cards":
      return <Cards s={s} />;
    case "steps":
      return <Steps s={s} />;
    case "profileHeader":
      return <ProfileHeader s={s} />;
    case "partners":
      return <Partners s={s} />;
    case "contact":
      return <Contact s={s} />;
    case "richText":
    default:
      return <RichText s={s} />;
  }
}

export function SectionRenderer({ sections }: { sections: IPageSection[] }) {
  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <>
      {sorted.map((s, i) =>
        s.lazy ? (
          <Reveal as="div" key={s.key ?? i}>
            <One s={s} />
          </Reveal>
        ) : (
          <One key={s.key ?? i} s={s} />
        ),
      )}
    </>
  );
}

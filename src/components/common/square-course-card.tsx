import Image from "next/image";
import Link from "next/link";

export interface SquareCourseCardData {
  href: string;
  title: string;
  image?: string;
  /** 제목 아래 두 번째 줄(회색). 홈=가격, 강의목록=부제 */
  subtitle?: string;
  /** 권한 없음 → 잠금 오버레이 + 구매/구독 버튼 */
  locked?: boolean;
  /** 잠금 시 구매하기 버튼 → 강의 상품 페이지 */
  productHref?: string;
  /** 잠금 시 구독으로 열람하기 → 프로그램(구독권) 구매 페이지 */
  subscribeHref?: string;
}

/**
 * 정사각 썸네일 + 제목 + 부제(둘째 줄) 카드.
 * 홈 강의 종목 쇼케이스와 /courses 목록이 공통으로 사용한다.
 * locked=true 이면 링크 대신 잠금 오버레이(열쇠 + 구매/구독 버튼)를 노출.
 */
export function SquareCourseCard({
  href,
  title,
  image,
  subtitle,
  locked = false,
  productHref,
  subscribeHref,
}: SquareCourseCardData) {
  const thumb = (
    <div className="group/thumb relative aspect-square overflow-hidden rounded-lg bg-[#f5f5f5] shadow-sm transition-shadow duration-500 hover:shadow-xl">
      {image && (
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover/thumb:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      )}
      {locked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 opacity-0 backdrop-blur-[1px] transition-opacity duration-300 group-hover/thumb:opacity-100">
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <rect
              x="4"
              y="10"
              width="16"
              height="10"
              rx="2"
              stroke="white"
              strokeWidth="1.6"
            />
            <path
              d="M8 10V7a4 4 0 0 1 8 0v3"
              stroke="white"
              strokeWidth="1.6"
            />
          </svg>
          <div className="flex flex-col items-center gap-2">
            <Link
              href={productHref ?? href}
              className="rounded-full bg-white px-6 py-2 text-[13px] font-bold text-black transition hover:bg-white/90"
            >
              구매하기
            </Link>
            <Link
              href={subscribeHref ?? "/programs"}
              className="rounded-full border border-white/70 px-6 py-2 text-[13px] font-semibold text-white transition hover:bg-white/10"
            >
              구독으로 열람하기
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  const caption = (
    <div className="mt-3">
      <h3 className="text-[16px] font-bold text-klead-gray-800">{title}</h3>
      {subtitle && (
        <p className="mt-1 whitespace-pre-line text-[14px] leading-relaxed text-klead-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );

  // 잠금: 카드 전체 링크 대신 오버레이 버튼으로만 이동
  if (locked) {
    return (
      <div className="group block">
        {thumb}
        {productHref ? (
          <Link href={productHref}>{caption}</Link>
        ) : (
          caption
        )}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group block transition-transform duration-500 ease-out hover:-translate-y-1.5"
    >
      {thumb}
      {caption}
    </Link>
  );
}

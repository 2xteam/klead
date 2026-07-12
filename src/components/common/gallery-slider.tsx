import Image from "next/image";

/**
 * 이미지 무한 자동 슬라이더 (owl-carousel 스타일).
 * 이미지 목록을 2배로 복제해 klead-marquee 키프레임으로 끊김 없이 흐른다.
 */
export function GallerySlider({
  images,
  reverse = false,
  height = 240,
  itemWidth = 320,
}: {
  images: string[];
  reverse?: boolean;
  height?: number;
  itemWidth?: number;
}) {
  const list = images.filter(Boolean);
  if (!list.length) return null;
  // 화면을 채울 만큼 이미지가 적으면 연속으로 복제해 끊김 없이 흐르게 한다.
  // 한 세트(base)가 충분히 넓어야(≥ 초광폭 뷰포트) -50% 이동 시 빈 공간이 안 생긴다.
  const MIN_PER_SET = Math.ceil(2600 / itemWidth); // 초광폭 화면도 커버
  const base: string[] = [];
  while (base.length < MIN_PER_SET) base.push(...list);
  const loop = [...base, ...base];
  const duration = Math.max(20, base.length * 5);

  return (
    <div className="w-full overflow-hidden">
      <div
        className="flex w-max"
        style={{
          animation: `klead-marquee ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {loop.map((src, i) => (
          <div
            key={i}
            className="relative shrink-0 overflow-hidden bg-white/5"
            style={{ height, width: itemWidth }}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes={`${itemWidth}px`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

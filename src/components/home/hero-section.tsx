const HERO_BG =
  "https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev/klead/assets/hero-bg.jpg";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0b0b0d]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
      <div className="relative mx-auto flex min-h-[620px] max-w-[1280px] flex-col items-center justify-center px-4 py-28 text-center lg:px-6">
        <p
          className="animate-fade-in-up text-[30px] font-medium leading-tight text-white/90 sm:text-[40px]"
          style={{ animationDelay: "0.1s" }}
        >
          뷰티 전문가를 위한 첫걸음
        </p>
        <h1
          className="animate-fade-in-up mt-1 text-[34px] font-bold leading-tight text-white sm:text-[46px]"
          style={{ animationDelay: "0.2s" }}
        >
          지금, 클리드에서
        </h1>
        <div
          className="animate-fade-in-up mt-8 space-y-1 text-[14px] leading-7 text-white/70 sm:text-[15px]"
          style={{ animationDelay: "0.35s" }}
        >
          <p>대한민국 K-뷰티 산업을 리드하는 리더의 출발점</p>
          <p>기술이 아니라 브랜드 오너가 되는 구조</p>
          <p>단순한 학원이 아니라 성장하는 플랫폼</p>
        </div>
        <p
          className="animate-fade-in-up mt-8 text-[18px] font-bold text-white sm:text-[22px]"
          style={{ animationDelay: "0.5s" }}
        >
          클리드와 함께 성공을 설계해보세요<span className="italic">!</span>
        </p>
      </div>
    </section>
  );
}

import { HeroSection } from "@/components/home/hero-section";
import { ValueCardsSection } from "@/components/home/value-cards-section";
import { CtaBannerSection } from "@/components/home/cta-banner-section";
import { CourseShowcaseSection } from "@/components/home/course-showcase-section";
import { PartnersSection } from "@/components/home/partners-section";
import { InstagramSection } from "@/components/home/instagram-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ValueCardsSection />
      <CtaBannerSection />
      <CourseShowcaseSection />
      <PartnersSection />
      <InstagramSection />
    </>
  );
}

---
name: humanizer-ui
description: KLEAD(klead.kr) UI 구현 시 AI 디자인 티를 제거하고 운영 사이트 디자인을 픽셀 단위로 클론한다. UI 컴포넌트, 페이지 레이아웃, Tailwind 스타일, shadcn 커스터마이징, 홈페이지·헤더·푸터 작업 시 사용.
---

# Humanizer UI — KLEAD 디자인 클론

## 목적

생성형 AI가 만드는 "템플릿 느낌" UI를 금지하고, https://klead.kr/ 운영 사이트와 구분되지 않는 사람이 설계한 인터페이스를 구현한다.

## 작업 전 필수

1. `docs/03-design-system-klead.md` 읽기
2. `docs/design/reference/` 스크린샷 확인 (없으면 klead.kr 캡처 요청)
3. 구현 대상 페이지의 운영 사이트 URL 확인

## 디자인 토큰 (하드코딩 금지 — CSS 변수 사용)

- Primary: `#7407ff`
- Font: `Poppins`, `Pretendard`
- Header height: `70px`
- Card dark bg: `#000000`
- Text muted: `#838383`, `#979797`
- Overlay: `rgba(4, 4, 4, 0.6)`

## 금지 패턴 (AI Slop)

- Inter, Roboto, Arial, system-ui 단독 사용
- 보라색→흰색 그라데이션 히어로
- 과도한 border-radius (16px+ 카드)
- drop-shadow 남용
- shadcn 기본 테마 그대로 사용
- lucide 아이콘만으로 구성된 빈 화면
- 균일한 4열 동일 높이 카드 그리드 (klead는 스태거)

## 필수 패턴 (klead 정체성)

- 4가치 카드: 비대칭 스태거 레이아웃 (PC)
- CTA: 풀폭 배경 + 다크 오버레이 + pill 버튼
- 강의 카드: 썸네일 hover overlay, "가격문의" 문구
- 네비 hover: `#d4d4d4`
- fadeInUp 스크롤 애니메이션 (0.7s, stagger)
- 푸터 3열 (SNS / 강의종목 / 페이지)

## shadcn 사용 시

1. `components/ui/*` 래핑 컴포넌트 생성 (`KleadButton`, `KleadCard`)
2. `tailwind.config`에 klead 토큰 매핑
3. 기본 `rounded-lg`, `shadow-md` 제거 또는 오버라이드

## 완료 전 자가 검수

- [ ] Primary color가 #7407ff인가
- [ ] 폰트가 Pretendard+Poppins인가
- [ ] AI 템플릿 느낌이 나는가 → 있으면 재작업
- [ ] 모바일에서 klead와 유사한가
- [ ] `prefers-reduced-motion` 대응했는가
- [ ] WCAG AA 대비 충족하는가

## 참고 파일

- `docs/03-design-system-klead.md`
- `docs/01-development-plan.md` (IA, 페이지 맵)

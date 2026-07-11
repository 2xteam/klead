# 클리드(KLEAD) 디자인 시스템 — klead.kr 클론 스펙

> 목표: 운영 사이트와 **시각적으로 구분 불가** 수준의 클론
> 원칙: AI 디자인 티 제거 (humanizer-ui 스킬 적용)

---

## 1. 브랜드

| 항목 | 값 |
|------|-----|
| 서비스명 | 클리드 (KLEAD) |
| 슬로건 | Beauty Mastery Academy / 뷰티양성교육기관 |
| 포지셔닝 | 실전형 뷰티 교육자 양성, 기술+교육설계+컨설팅 |

---

## 2. 컬러 토큰

```css
:root {
  /* Brand */
  --klead-primary: #7407ff;
  --klead-primary-hover: #5f06d4;

  /* Neutral */
  --klead-black: #000000;
  --klead-gray-900: #212121;
  --klead-gray-800: #363636;
  --klead-gray-700: #4b4b4b;
  --klead-gray-600: #757575;
  --klead-gray-500: #838383;
  --klead-gray-400: #979797;
  --klead-gray-300: #a9a9a9;
  --klead-gray-200: #d4d4d4;
  --klead-gray-100: #dedede;
  --klead-gray-50: #e7e7e7;
  --klead-white: #ffffff;

  /* Surface */
  --klead-card-bg: #000000;
  --klead-overlay: rgba(4, 4, 4, 0.6);
  --klead-footer-bg: #222222;
  --klead-footer-border: #414141;

  /* Text on dark */
  --klead-text-on-dark: #ffffff;
  --klead-text-muted-on-dark: #dedede;
}
```

**금지**: 보라 그라데이션 남용, Inter/Roboto 기본 폰트, 둥근 카드+그림자 AI 클리셰

---

## 3. 타이포그래피

| 용도 | 폰트 | 크기 | 굵기 |
|------|------|------|------|
| 로고/브랜드 | Pretendard | 36px (PC) | bold |
| H1 (히어로) | Pretendard | 36px | bold |
| H2 (섹션) | Pretendard | 30px | bold |
| H4 (프로모) | Pretendard | ~24px | bold |
| 카드 타이틀 | Pretendard | 22px | bold |
| 카드 본문 | Pretendard | 16px | regular |
| 네비게이션 | Poppins, Pretendard | 15px | inherit |
| 푸터 링크 | Pretendard | 13px | regular |
| 캡션 | Pretendard | 13px | regular, #979797 |

```css
font-family: 'Poppins', 'Pretendard Variable', 'Pretendard', -apple-system, sans-serif;
```

---

## 4. 레이아웃

### Header

- 높이: **70px** (고정)
- 배경: 흰색 / 스크롤 시 동일
- 로고: 좌측, width ~115px (PC), ~100px (scroll/mobile)
- 네비: 중앙~우측, padding `0 18px`, hover `#d4d4d4`
- 로그인 버튼: 우측, 텍스트 버튼 스타일
- 모바일: 햄버거 → 슬라이드 메뉴

### Container

- max-width: imweb 기준 ~1200px (실측 후 조정)
- section padding: 상하 68~120px

### Grid

- 4가치 카드: **3열 비대칭 스태거** (PC)
  - 카드1: 상단
  - 카드2: 115px offset
  - 카드3: 상단
  - 카드4: 115px offset
- 강의 쇼케이스: 3열 카드 (thumb + overlay)

---

## 5. 컴포넌트 스펙

### Value Card (4대 가치)

```
┌─────────────────────┐
│ [배경: #000 또는 img] │
│ 학습자 중심 (22px bold)│
│ 대상에 따라           │
│ 다른 수업 커리큘럼     │
│ [아이콘 이미지]        │
└─────────────────────┘
```

- 배경: `#000` 또는 `background-image` + darken
- 텍스트: 제목 `#fff`, 본문 `#dedede`
- 애니메이션: `fadeInUp`, duration 0.7s, stagger delay 0~0.6s
- 클릭: 각 카드 `/about` 하위 섹션 링크

### CTA Banner

- 배경: 풀폭 이미지 + `rgba(4,4,4,0.6)` 오버레이
- 텍스트: 중앙 정렬, 30px bold white
- 버튼: `border-radius: 9999px` (pill), 기본 스타일

### Course Card (쇼케이스)

- 썸네일: lazy load, hover overlay
- 제목: 16px bold `#363636`
- 가격: "가격문의" (bold)
- 링크: 상세 페이지

### Button Variants

| 타입 | 스타일 |
|------|--------|
| Primary | `#7407ff` bg, white text |
| Default/Pill | 흰 배경, 둥근 (9999px) |
| Text/Login | 텍스트만, `#161616` |

---

## 6. 페이지별 섹션 (홈)

1. **Hero Copy**
   - "클리드 실전형 교육자 양성 과정" (gray #838383)
   - "클리드는 단순히 / 기술을 배우는 곳이 아닙니다." (36px bold)

2. **4 Value Cards** — 학습자중심·실전중심·상호작용·성과기반

3. **CTA Section**
   - "클리드의 소속이 되는 순간 / 누구도 범접할 수 없는 전문 강사가 됩니다."
   - [바로 알아보기] → /community

4. **Course Showcase**
   - "클리트 강의 종목 카테고리"
   - "얼리버드 할인 마감임박!"
   - 3개 카드 (컨설팅, 페이스디자인, 두피관리)
   - [더보기 +] → /courses

5. **Instagram Feed**
   - @klead_official
   - 그리드/슬라이드

6. **Footer**
   - 3열: SNS | 강의종목 | 페이지바로가기
   - 회사정보: 상호 클리드:KLEAD, 대표 김보령
   - Copyright @2026 KLEAD

---

## 7. 에셋 목록 (이관 필요)

| 에셋 | 운영 URL (참고) |
|------|-----------------|
| 로고 (기본) | cdn.imweb.me/thumbnail/20260710/ff28bbe70a495.png |
| 로고 (스크롤) | cdn.imweb.me/thumbnail/20260710/d1b918365b0c0.png |
| OG 이미지 | cdn.imweb.me/upload/.../ce858212a2ff7.png |
| 가치 카드 아이콘 4종 | cdn.imweb.me/upload/S20251222.../*.png |
| CTA 배경 | cdn.imweb.me/thumbnail/20260203/7614a5ff9f642.jpg |
| 강의 썸네일 3종 | cdn-optimized.imweb.me/upload/... |

> MVP: R2에 재업로드, SiteSettings에서 URL 관리

---

## 8. 반응형

| Breakpoint | 동작 |
|------------|------|
| ≥992px | 4카드 스태거, 풀 네비 |
| 768~991px | 2열 카드 |
| <768px | 1열 스택, 모바일 메뉴, 카드 offset 제거 |

---

## 9. 애니메이션

- 스크롤 진입: `fadeInUp` (0.7s)
- 호버: opacity/brightness (과하지 않게)
- `prefers-reduced-motion`: 애니메이션 비활성화

---

## 10. humanizer-ui 스킬 규칙 (요약)

1. klead 토큰 외 색상 사용 금지
2. shadcn 기본 스타일 그대로 쓰지 말 것 — 토큰 오버라이드 필수
3. 카드 border-radius: 운영 사이트 실측값 (대체로 0~소량)
4. 그림자 최소화, 플랫+고대비 선호
5. 이미지 위 텍스트는 overlay로 가독성 확보
6. "가격문의" 등 운영 문구 그대로 유지

---

## 11. QA 체크리스트 (디자인)

- [ ] Primary color #7407ff 일치
- [ ] Header 70px, 폰트 Poppins+Pretendard
- [ ] 4카드 스태거 레이아웃 (PC)
- [ ] CTA pill 버튼
- [ ] 푸터 3열 구조
- [ ] 모바일 메뉴 동작
- [ ] 운영 사이트 스크린샷 diff < 5% (시각 회귀)

# klead.kr 실사이트 콘텐츠 감사 (Content Audit)

> 실제 https://klead.kr/ 를 Playwright(headless Chromium)로 렌더링하여 추출한 원본 데이터.
> 목적: 클론의 정보구조(IA)·콘텐츠를 실사이트 기준으로 정합화(reconcile).
> 수집일 기준 사이트 스냅샷. 스크린샷: `docs/design/reference/*.png` (26개), 원본 추출 JSON은 세션 스크래치패드.

## 1. 사이트 개요

| 항목 | 값 |
|------|-----|
| 빌더 | IMWEB (Vue 기반) — **대부분 하위 페이지가 클라이언트 렌더링** |
| title | 클리드 : 뷰티양성교육기관 |
| description / OG | Beauty Mastery Academy |
| 상호명 | 클리드 : KLEAD |
| 대표자 | 김보령 |
| 대표 이메일 | queenseohj891121@gmail.com |
| 대표 공개 메일 | klead.official@gmail.com (mailto 링크엔 nobaseclass@gmail.com 도 혼재) |
| Instagram | https://www.instagram.com/klead_official |
| 카카오채널 | https://pf.kakao.com/_Ptxign |
| 호스팅 | (주)아임웹 |

> **핵심 특성**: 강의 소개·커리큘럼 등 실질 콘텐츠가 대부분 **긴 이미지(PNG)로 제작**되어 있음.
> 텍스트로 뽑히는 정보는 메뉴·제목·상품 요약 수준. 이미지 안의 텍스트를 데이터화하려면 OCR 또는 수기 전사가 필요.

## 2. 실제 정보구조 (Ground Truth IA)

sitemap.xml은 불완전. 실제 내비게이션 링크에서 추출한 전체 구조:

```
클리드(About)        → /about
테크 큐레이터         → /34
    김보령           → /01
    김유정           → /02
    신세미           → /03
    문설희           → /04
전문가 과정           → /33
    (4단계 성장구조 앵커: /20 학습자중심 /21 실전중심 /22 상호작용 /23 성과기반  ← 빈 셸 페이지)
강의 종목             → /class
    왁싱             → /27
    두피관리          → /28
    이론             → /29
    경영             → /30
    피부관리          → /32
강의 후기             → /review
강의 Q&A             → /qna
커뮤니티              → /community
```

## 3. 강의/상품 (shop_view = 판매 상품)

class 페이지의 대표 상품 3종 (idx = 상품 ID):

| idx | 제목 | 요약 |
|-----|------|------|
| 12 | 뷰티샵 출장 컨설팅 원데이 심화 과정 | 듣기만 하고 끝나는 것이 아닌, 실행 가능한 구조를 그 자리에서 완성하는 출장 컨설팅 |
| 10 | 페이스 디자인 투데이 실습과정 | 왁싱샵의 매출·경쟁력을 고민한다면 페이스 왁싱 디자인부터 마스터 |
| 7 | 두피관리 원데이 실습과정 | 단가는 낮아도 하루 매출을 채우는 두피관리 |

## 4. 홈 구성 요소

- 히어로: "뷰티 전문가를 위한 첫걸음 — 지금, 클리드에서"
- 대표 상품 3종 카드 (위 표)
- 인스타그램 피드 연동 (게시물 다수 — 세미나/왁싱/두피/컨설팅 홍보 카피 풍부, `bodyText`에 원문 보존)
- 파트너 섹션, Contact us
- 4단계 가치 카드: 학습자 중심 / 실전 중심 / 상호작용 기반 / 성과 기반

## 5. 현재 클론과의 불일치 (수정 필요)

`src/config/site.ts` 대조 결과:

| 항목 | 클론(현재) | 실사이트 | 조치 |
|------|-----------|---------|------|
| 카카오채널 | `pf.kakao.com/_klead` | `pf.kakao.com/_Ptxign` | 수정 |
| 유튜브 | `youtube.com/@klead_official` | (실사이트에 없음) | 확인/제거 |
| 강의 카테고리 | 왁싱/두피/이론/경영/피부 + **바디관리** | 바디관리 **없음** | `바디관리` 제거 |
| 강의 상세 경로 | `/courses/waxing` 등 슬러그 | 실제는 상품 idx(7/10/12) 기반 | slug↔idx 매핑 정의 필요 |
| 큐레이터 페이지 | slug(kim-boryeong 등) | 번호 라우트(/01~/04) | 매핑 유지, 원본은 번호 |

> 내비게이션·브랜드 로고·가치카드·대표 상품 이미지는 실사이트 CDN과 일치 → 클론 IA 골격은 대체로 정확.
> 어색함의 원인은 (a) 일부 임의 추가 항목(바디관리), (b) 잘못된 SNS 링크, (c) 이미지 기반 콘텐츠를 텍스트로 옮기지 못한 빈 상세 페이지.

## 6. 이미지 콘텐츠 전사(OCR) 결과

Playwright로 페이지별 콘텐츠 이미지를 내려받아 비전으로 전사(서브에이전트 10개 병렬).

**핵심 발견 — 콘텐츠 소재 위치가 페이지 유형별로 다름:**

| 페이지 | 소재 | 전사 결과 |
|--------|------|-----------|
| 강의 상세 3종 (shop_view 7/10/12) | `<img>` 배너에 텍스트 | ✅ 커리큘럼 5·5·4단계 + 상세 전문 확보 |
| 큐레이터 01~04 / about / 전문가과정(33) / 테크큐레이터(34) | CSS `background-image` = **대부분 인물·포트폴리오 사진** | 전사할 본문 텍스트 거의 없음(사진 갤러리) |

- 실제 텍스트 콘텐츠는 **강의 상세·홈·class**에 집중. 나머지는 이미지(사진) 위주라 데이터화할 텍스트가 적음.
- **큐레이터 프로필의 유일한 텍스트 출처**: 출장컨설팅(idx=12) 페이지 하단에 김보령 대표의 경력·자격/수상이 텍스트로 존재 → Instructor 시드에 반영.
- 가격: 3종 모두 사이트에 **미표기(가격문의)** → `priceDisplay: "inquiry"`.

## 7. 시드 결과 (B)

- 데이터: `scripts/data/klead-classes.json` (전사본 정규화, 리포지토리에 영구 보관)
- 스크립트: `scripts/seed-classes.mjs` — `npm run seed:classes`
- 등록: `Content(type=lecture)` 3건 + `Instructor(김보령)` 1건
  - 각 강의 `sections[]` = insight / curriculum / philosophy
  - `slug`: `scalp-oneday`, `face-design-today`, `consulting-oneday`
  - `lectureCategory`: scalp / face_design / business, `priceDisplay: inquiry`, `lectureMode: offline`
- 참고: 기존 `seed.mjs`의 합성 강의(예: "두피 구조와 진단")는 실제 klead.kr 강의와 무관한 placeholder → 실제 강의는 이 시드로 별도 등록.

## 8. 이미지 R2 이관

imweb CDN 의존을 끊고 자체 호스팅(Cloudflare R2 `templete` 버킷)으로 이관.

- 앱 라이브러리: `src/lib/storage/r2.ts` (`uploadObject`/`uploadFromUrl`/`deleteObject`/`publicUrl`/`listObjects`)
- 이관 스크립트: `scripts/migrate-images-to-r2.mjs` — `npm run migrate:images`
  - `src/config/site.ts` + `scripts/data/klead-classes.json`의 imweb URL 수집 → R2 `klead/assets/<파일명>` 업로드 → 소스의 URL을 R2 공개 URL로 치환
  - URL 매핑: `scripts/data/r2-image-map.json`
- 결과: 홈 페이지 이미지 참조 **imweb 0 / R2 17**. layout.tsx OG 이미지 포함.
- R2 설정: 버킷 `templete`, 공개 URL `https://pub-f23d3474a3434b20a1d6eefa94c25422.r2.dev` (읽기·쓰기·공개서빙 검증됨)

## 9. 재현 방법

세션 스크래치패드의 `scrape.mjs`를 프로젝트 루트에서 실행(node_modules 해석 위해):

```
node <scrape.mjs> <출력디렉토리> docs/design/reference [url목록파일]
```

- 각 URL: networkidle 대기 후 title/meta/OG/headings/images/links/bodyText 추출 + fullPage 스크린샷
- 의존성: `playwright` + `npx playwright install chromium` (설치됨)

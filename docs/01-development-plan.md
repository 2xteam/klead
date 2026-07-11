# 클리드(KLEAD) Beauty Academy Platform — 개발 계획서

> 버전: 1.0 | 작성일: 2026-07-10 | MVP 기준

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | 클리드 (KLEAD) — 뷰티양성교육기관 |
| 유형 | 구독형 LMS + CMS |
| 레퍼런스 | https://klead.kr/ (디자인·IA·콘텐츠 클론) |
| 목표 | 관리자 CMS + 회원 구독 기반 온라인 강의 플랫폼 |

---

## 2. klead.kr 분석 — 스펙 보완 사항

기존 설계에 **누락되었으나 운영 사이트에 존재**하는 요소:

| 구분 | 운영 사이트 현황 | 설계 반영 |
|------|------------------|-----------|
| 강사/큐레이터 | 테크 큐레이터 메뉴 (김보령, 김유정, 신세미, 문설희) | `Instructors` 컬렉션 + 강의/콘텐츠 연결 |
| 강의 카테고리 | 왁싱, 두피관리, **피부관리, 바디관리, 이론, 경영** | `Menus` 시드 + `Tags` 확장 |
| 전문가 과정 | 별도 랜딩 페이지 (/33) | `Content.category` = `expert_program` |
| 강의 후기 | /review (쇼핑몰 리뷰 연동) | `Reviews` 컬렉션 (Q&A·댓글과 분리) |
| 커뮤니티 | /community | `Contents.type` = `community` |
| 가격 문의 | "가격문의" (결제 없음) | `Inquiry` + 카카오채널 CTA (MVP) |
| 인스타그램 피드 | 홈 하단 IG 위젯 | `SiteSettings` + IG oEmbed/API |
| SNS | YouTube, Instagram, Kakao | `SiteSettings.snsLinks` |
| 원데이/오프라인 | 원데이 심화 과정 카드 | `Contents.lectureMode` = `online \| offline \| hybrid` |
| 알림 설정 | 공지사항 푸시 동의 UI | `Users.notificationPrefs` |
| 회사 정보 | 푸터 (상호, 대표, 이메일) | `SiteSettings.companyInfo` |

---

## 3. 개발 하네스 구성 (Superpowers + Agent Memory)

### 3.1 필수 플러그인/스킬 설치

```text
# Cursor Agent에서 실행
/add-plugin superpowers

# Agent Memory (세션 간 작업 기록)
npm install -g @agentmemory/agentmemory
agentmemory connect cursor
agentmemory install-skills
```

### 3.2 프로젝트 로컬 스킬

| 스킬 | 경로 | 용도 |
|------|------|------|
| humanizer-ui | `.cursor/skills/humanizer-ui/` | AI 티 제거, klead 디자인 토큰 준수 |
| klead-domain | `.cursor/skills/klead-domain/` | 도메인 용어·권한·메뉴 규칙 |
| agent-memory | `~/.cursor/skills/agent-memory/` | 작업 내역 지속 문서화 |

### 3.3 Superpowers 워크플로 (강제)

```
Phase 0: brainstorming        → 요구사항·엣지케이스 정리
Phase 1: writing-plans        → 구현 계획 (본 문서 기반)
Phase 2: executing-plans      → 배치별 구현 + 체크포인트
Phase 3: test-driven-dev      → RED → GREEN → REFACTOR
Phase 4: finishing-branch     → 린트·테스트·문서·PR
Phase 5: verification         → 수동 QA + E2E
```

### 3.4 문서화 규칙 (개발 전·중·후)

| 시점 | 산출물 | 위치 |
|------|--------|------|
| 개발 전 | ADR, API 명세, ERD | `docs/` |
| 개발 중 | agent-memory daily log | `agentmemory` |
| 개발 후 | 운영 매뉴얼 | `docs/manual/` |
| 개발 후 | 테스트 가이드 | `docs/testing/` |

**금지**: 설계 승인 없이 코드 작성, 테스트 없이 기능 완료 선언

---

## 4. 기술 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│  Vercel (Next.js App Router)                            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ (public)    │  │ (member)     │  │ (admin)        │ │
│  │ 홈·메뉴·검색 │  │ 강의·구독·Mypage│  │ CMS·Analytics │ │
│  └─────────────┘  └──────────────┘  └────────────────┘ │
│         Route Handlers (/api/*)                         │
└──────────┬──────────────┬──────────────┬────────────────┘
           │              │              │
    MongoDB Atlas    Cloudflare R2   Bunny Stream
    (+ Atlas Search)  (첨부파일)      (영상)
           │
    Auth.js (Kakao OAuth)
```

### 4.1 모노레포 구조

```
klead/
├── docs/                    # 설계·매뉴얼
├── .cursor/
│   ├── skills/
│   └── rules/
├── src/
│   ├── app/
│   │   ├── (public)/        # 공개 페이지
│   │   ├── (member)/        # 로그인 회원
│   │   ├── (admin)/         # 관리자
│   │   └── api/             # Route Handlers
│   ├── components/
│   │   ├── ui/              # shadcn 기반
│   │   ├── layout/          # Header, Footer, Nav
│   │   ├── content/         # 게시글·강의
│   │   └── admin/
│   ├── lib/
│   │   ├── db/              # MongoDB client, models
│   │   ├── auth/            # Auth.js config
│   │   ├── permissions/     # 권한 검증
│   │   ├── bunny/           # Bunny Stream API
│   │   ├── r2/              # R2 presigned URL
│   │   └── search/          # Atlas Search
│   ├── hooks/
│   └── types/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/                 # Playwright
└── scripts/                 # 시드, 마이그레이션
```

### 4.2 핵심 라이브러리

| 영역 | 선택 |
|------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + CSS Variables |
| UI | shadcn/ui (klead 토큰 오버라이드) |
| DB ODM | Mongoose |
| Auth | Auth.js v5 + Kakao Provider |
| Validation | Zod |
| Forms | React Hook Form |
| Editor | Tiptap (CMS) |
| Test | Vitest + Playwright + MSW |
| Lint | ESLint + Prettier |

---

## 5. MVP 개발 페이즈 (총 12~14주 예상)

### Phase 0 — 기반 구축 (1.5주)

- [ ] Next.js 프로젝트 초기화, 환경변수 템플릿
- [ ] MongoDB Atlas 연결, 공통 스키마/인덱스
- [ ] Auth.js + 카카오 로그인
- [ ] R2, Bunny Stream 클라이언트 래퍼
- [ ] 디자인 토큰·레이아웃 셸 (klead 클론)
- [ ] CI (lint, typecheck, test)

**산출물**: 로그인 가능한 빈 셸, Header/Footer 클론

### Phase 1 — CMS 코어 (2.5주)

- [ ] Menus (무한 depth, MenuContents)
- [ ] Contents 통합 (content | lecture)
- [ ] SiteSettings (key/value)
- [ ] Popup (예약 노출)
- [ ] R2 파일 업로드
- [ ] Bunny 영상 등록 (videoId만 저장)
- [ ] 관리자 레이아웃 + 기본 CRUD

**산출물**: 관리자에서 메뉴·게시글·강의 등록 가능

### Phase 2 — 권한·구독 (2주)

- [ ] Programs, PermissionTypes, ProgramPermissions
- [ ] Subscriptions, UserPermissions
- [ ] ContentPermissions + 접근 가드 미들웨어
- [ ] 강의 시청 페이지 (Bunny embed)
- [ ] 예약 게시 (startDt/endDt)

**산출물**: 권한별 강의 접근 제어

### Phase 3 — 회원·커뮤니티 (2주)

- [ ] Mypage (내 정보, 내 구독)
- [ ] Comments, Likes
- [ ] FAQ, QnA
- [ ] Reviews (강의 후기)
- [ ] Community 게시판
- [ ] Pinned 공지

**산출물**: 회원 참여 기능 전체

### Phase 4 — 공개 사이트 클론 (2.5주)

- [ ] 홈 (4가치 카드, CTA, 강의 쇼케이스, IG)
- [ ] 클리드 소개 (/about)
- [ ] 테크 큐레이터 + 강사 프로필
- [ ] 전문가 과정, 강의 종목 목록/상세
- [ ] 검색 (Atlas Search)
- [ ] SEO 메타, Sitemap, RSS

**산출물**: klead.kr과 시각·IA 동등 수준

### Phase 5 — Analytics·QA (1.5주)

- [ ] 관리자 Analytics 대시보드
- [ ] E2E 테스트 (핵심 플로우)
- [ ] 운영 매뉴얼 (관리자/회원)
- [ ] 성능·접근성 점검

**산출물**: MVP 오픈 가능 상태

---

## 6. 페이지 맵 (IA)

### Public

| 경로 | 설명 | klead.kr 대응 |
|------|------|---------------|
| `/` | 홈 | `/` |
| `/about` | 클리드 소개 | `/about` |
| `/curators` | 테크 큐레이터 목록 | `/34` |
| `/curators/[slug]` | 강사 프로필 | `/01`~`/04` |
| `/expert` | 전문가 과정 | `/33` |
| `/courses` | 강의 종목 | `/class` |
| `/courses/[slug]` | 종목별 강의 목록 | `/27` 등 |
| `/contents/[slug]` | 게시글/강의 상세 | 동적 |
| `/review` | 강의 후기 | `/review` |
| `/qna` | 강의 Q&A | `/qna` |
| `/community` | 커뮤니티 | `/community` |
| `/faq` | FAQ | 신규 |
| `/search` | 통합 검색 | 신규 |
| `/login` | 카카오 로그인 | 모달→페이지 |

### Member

| 경로 | 설명 |
|------|------|
| `/mypage` | 내 정보 |
| `/mypage/subscription` | 내 구독·권한 |
| `/lectures/[id]/watch` | 강의 시청 |

### Admin (`/admin/*`)

| 경로 | 설명 |
|------|------|
| `/admin` | 대시보드 (Analytics) |
| `/admin/menus` | 메뉴 관리 |
| `/admin/contents` | 게시글·강의 |
| `/admin/instructors` | 강사 관리 |
| `/admin/members` | 회원 관리 |
| `/admin/programs` | 프로그램 |
| `/admin/permissions` | 권한 |
| `/admin/popup` | 팝업 |
| `/admin/settings` | SiteSettings |
| `/admin/faq` | FAQ |
| `/admin/qna` | Q&A 답변 |

---

## 7. API 설계 원칙

- RESTful Route Handlers (`/api/v1/*`)
- 모든 요청/응답 Zod 검증
- 관리자 API: `role === 'admin'` 가드
- 강의 시청 API: ContentPermission ∩ UserPermission
- 파일 업로드: presigned URL (클라이언트 → R2 직접)
- 영상: Bunny webhook으로 인코딩 상태 동기화

### 주요 엔드포인트 (요약)

```
GET    /api/v1/menus/tree
GET    /api/v1/contents?menuId&type&page
GET    /api/v1/contents/[id]
POST   /api/v1/contents              (admin)
GET    /api/v1/lectures/[id]/access   (권한 확인 + Bunny token)
POST   /api/v1/upload/presign         (admin)
GET    /api/v1/search?q=
GET    /api/v1/me/subscriptions
POST   /api/v1/comments
POST   /api/v1/likes
GET    /api/v1/analytics/summary      (admin)
GET    /api/sitemap.xml
GET    /api/rss/notices.xml
```

---

## 8. 권한 모델 상세

```
Program (Basic, Premium, Master)
    └── ProgramPermissions[] → PermissionType (Waxing_Basic, ...)

User
    └── Subscriptions[] → Program (기간: startAt, endAt)
    └── UserPermissions[] → PermissionType (개별 부여/회수)

Content
    └── ContentPermissions[] → PermissionType (OR 조건)

접근 로직:
  canAccess(user, content) =
    content.isPublic
    OR (now BETWEEN content.startDt AND content.endDt)
    AND (
      user.role === 'admin'
      OR ∃ p ∈ content.permissions :
           p ∈ user.permissions
           OR p ∈ activeProgramPermissions(user.subscriptions)
    )
```

---

## 9. 테스트 전략

| 레벨 | 도구 | 범위 |
|------|------|------|
| Unit | Vitest | permissions, date utils, zod schemas |
| Integration | Vitest + mongodb-memory-server | API handlers |
| E2E | Playwright | 로그인→강의시청, CMS CRUD |
| Visual | Playwright screenshot | 홈·헤더 klead 대비 |

### 필수 E2E 시나리오

1. 카카오 로그인 → Mypage 진입
2. 권한 없는 강의 → 차단 UI
3. 권한 있는 강의 → Bunny 재생
4. 관리자: 메뉴 생성 → 콘텐츠 연결 → 공개 확인
5. 예약 게시: startDt 이전 비공개
6. 검색: 제목·태그 매칭
7. Sitemap/RSS XML 유효성

---

## 10. 환경 변수

```env
# App
NEXT_PUBLIC_APP_URL=
NEXTAUTH_URL=
AUTH_SECRET=

# Kakao
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

# MongoDB
MONGODB_URI=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=

# Bunny Stream
BUNNY_LIBRARY_ID=
BUNNY_API_KEY=
BUNNY_CDN_HOSTNAME=

# Optional
INSTAGRAM_ACCESS_TOKEN=
```

---

## 11. 2차 개발 (MVP 이후)

결제(토스), ContentHistory, Audit Log, Redis 캐시, 검색 고도화, 시청 진행률, 관리자 Role, 알림톡 — 기존 스펙 유지

---

## 12. 리스크 & 대응

| 리스크 | 대응 |
|--------|------|
| klead 디자인 픽셀 불일치 | 디자인 토큰 문서 + 스크린샷 diff |
| Bunny 토큰 보안 | 서버 사이드 signed URL, 짧은 TTL |
| 권한 복잡도 | 단일 `canAccess()` 모듈, 테스트 100% |
| imweb URL 마이그레이션 | slug 매핑 테이블, 301 리다이렉트 |
| IG API 제한 | oEmbed fallback + 수동 갱신 |

---

## 13. 다음 액션 (즉시)

1. 본 계획 + DB 스키마 리뷰/승인
2. Superpowers + Agent Memory 설치
3. Phase 0 착수: `create-next-app` + 디자인 토큰
4. klead.kr 전체 페이지 스크린샷 아카이브 (디자인 기준선)

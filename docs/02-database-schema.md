# 클리드(KLEAD) — MongoDB Database Schema

> 버전: 1.0 | MongoDB Atlas | Mongoose ODM

---

## 1. 설계 원칙

- `_id`: ObjectId (기본)
- 공통 필드: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`
- Soft delete: `deletedAt` (필요 컬렉션)
- Slug: URL용 고유 식별자 (`slug` unique index)
- 날짜: ISO 8601, UTC 저장 / KST 표시
- 다국어: MVP는 `ko` only, 스키마에 `locale` 예약

---

## 2. ERD (관계 요약)

```
Users ─────┬──── Subscriptions ──── Programs ──── ProgramPermissions ──── PermissionTypes
           │                                                              ↑
           └──── UserPermissions ─────────────────────────────────────────┘

Menus (self-ref parentId) ──── MenuContents ──── Contents ──── ContentPermissions
                                                      │
                      ┌───────────────────────────────┼───────────────────────────────┐
                      │                               │                               │
                 Comments                          Likes                          Tags (ref)
                      │
                 Reviews (lecture only)

Contents.instructorId ──── Instructors

FAQ, QnA, Popup, SiteSettings (독립)
Payments, WebhookLogs (2차 예약)
```

---

## 3. 공통 서브스키마

### SeoMeta

```typescript
{
  title: string;           // max 70
  description: string;     // max 160
  keywords: string[];
  ogImage?: string;        // R2 URL
  ogTitle?: string;
  ogDescription?: string;
  noIndex?: boolean;
}
```

### PublishSchedule

```typescript
{
  startDt?: Date;          // null = 즉시
  endDt?: Date;            // null = 무기한
  status: 'draft' | 'scheduled' | 'published' | 'expired';
}
```

### Attachment

```typescript
{
  _id: ObjectId;
  fileName: string;
  fileSize: number;
  mimeType: string;
  r2Key: string;
  publicUrl: string;
  uploadedAt: Date;
}
```

---

## 4. 컬렉션 상세

### 4.1 Users

```typescript
{
  _id: ObjectId;
  email?: string;
  name: string;
  nickname?: string;
  profileImage?: string;
  phone?: string;

  // Auth.js
  authProvider: 'kakao';
  authProviderId: string;        // unique with authProvider

  role: 'member' | 'admin';      // MVP: 단일 admin role
  status: 'active' | 'suspended' | 'withdrawn';

  notificationPrefs: {
    notice: boolean;
    marketing: boolean;
    qnaReply: boolean;
  };

  lastLoginAt?: Date;
  withdrawnAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Indexes
{ authProvider: 1, authProviderId: 1 }  // unique
{ email: 1 }                             // sparse unique
{ role: 1, status: 1 }
{ createdAt: -1 }
```

---

### 4.2 Instructors (신규 — klead 테크 큐레이터)

```typescript
{
  _id: ObjectId;
  slug: string;                  // 'kim-boryeong'
  name: string;                  // 김보령
  title?: string;                // 직함
  bio: string;                   // HTML/Markdown
  profileImage?: string;
  specialties: string[];         // ['왁싱', '페이스디자인']
  career?: string;
  snsLinks?: {
    instagram?: string;
    youtube?: string;
  };
  sortOrder: number;
  isPublished: boolean;

  seo: SeoMeta;
  createdAt: Date;
  updatedAt: Date;
}

// Indexes
{ slug: 1 }                      // unique
{ isPublished: 1, sortOrder: 1 }
```

---

### 4.3 Programs

```typescript
{
  _id: ObjectId;
  code: string;                  // 'basic', 'premium', 'master'
  name: string;                  // 'Basic'
  description?: string;
  sortOrder: number;
  isActive: boolean;

  // 2차: pricing
  priceMonthly?: number;
  priceYearly?: number;

  createdAt: Date;
  updatedAt: Date;
}

// Indexes
{ code: 1 }                      // unique
{ isActive: 1, sortOrder: 1 }
```

---

### 4.4 PermissionTypes

```typescript
{
  _id: ObjectId;
  code: string;                  // 'Waxing_Basic'
  name: string;                  // '왁싱 입문'
  category: string;              // 'Waxing' | 'Eyebrow' | 'Scalp' | 'FaceDesign' | 'Theory' | 'Business'
  level?: 'basic' | 'master' | 'expert';
  description?: string;
  sortOrder: number;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// Indexes
{ code: 1 }                      // unique
{ category: 1, level: 1 }
```

**시드 데이터 예시**

| code | category |
|------|----------|
| Waxing_Basic | Waxing |
| Waxing_Master | Waxing |
| Eyebrow_Basic | Eyebrow |
| Eyebrow_Master | Eyebrow |
| Scalp_Basic | Scalp |
| FaceDesign_Master | FaceDesign |
| SkinCare_Basic | SkinCare |
| BodyCare_Basic | BodyCare |
| Theory_Basic | Theory |
| Business_Basic | Business |

---

### 4.5 ProgramPermissions

```typescript
{
  _id: ObjectId;
  programId: ObjectId;           // ref: Programs
  permissionTypeId: ObjectId;      // ref: PermissionTypes

  createdAt: Date;
}

// Indexes
{ programId: 1, permissionTypeId: 1 }  // unique compound
{ programId: 1 }
```

---

### 4.6 Subscriptions

```typescript
{
  _id: ObjectId;
  userId: ObjectId;              // ref: Users
  programId: ObjectId;           // ref: Programs

  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startAt: Date;
  endAt: Date;

  // 2차: 결제 연동
  paymentId?: ObjectId;
  autoRenew: boolean;

  grantedBy?: ObjectId;          // admin 수동 부여 시
  note?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Indexes
{ userId: 1, status: 1 }
{ userId: 1, programId: 1 }
{ endAt: 1, status: 1 }          // 만료 배치
```

---

### 4.7 UserPermissions

```typescript
{
  _id: ObjectId;
  userId: ObjectId;
  permissionTypeId: ObjectId;

  source: 'manual' | 'subscription' | 'promotion';
  sourceId?: ObjectId;           // subscriptionId 등
  startAt?: Date;
  endAt?: Date;                  // null = 무기한

  grantedBy?: ObjectId;
  note?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Indexes
{ userId: 1, permissionTypeId: 1 }
{ userId: 1, endAt: 1 }
```

---

### 4.8 Menus

```typescript
{
  _id: ObjectId;
  parentId?: ObjectId;           // null = root, self-ref
  slug: string;
  name: string;
  path?: string;                // '/courses/waxing' (커스텀 경로)
  linkType: 'internal' | 'external' | 'folder';
  externalUrl?: string;

  depth: number;                 // denormalized (0-based)
  sortOrder: number;
  isVisible: boolean;

  // 표시 옵션
  icon?: string;
  badge?: string;                // 'NEW'

  createdAt: Date;
  updatedAt: Date;
}

// Indexes
{ parentId: 1, sortOrder: 1 }
{ slug: 1 }                      // unique
{ isVisible: 1 }
```

**klead.kr 메뉴 시드**

```
클리드 (/about)
테크 큐레이터 (/curators)
  ├ 김보령
  ├ 김유정
  ├ 신세미
  └ 문설희
전문가 과정 (/expert)
강의 종목 (/courses)
  ├ 왁싱
  ├ 두피관리
  ├ 이론
  ├ 경영
  └ 피부관리
```

---

### 4.9 MenuContents

```typescript
{
  _id: ObjectId;
  menuId: ObjectId;
  contentId: ObjectId;
  sortOrder: number;

  createdAt: Date;
}

// Indexes
{ menuId: 1, contentId: 1 }      // unique
{ menuId: 1, sortOrder: 1 }
{ contentId: 1 }
```

---

### 4.10 Contents (통합)

```typescript
{
  _id: ObjectId;
  slug: string;
  type: 'content' | 'lecture';

  // content 세부 유형
  contentCategory?: 'notice' | 'resource' | 'event' | 'guide' | 'community' | 'about' | 'expert_program';
  // lecture 세부
  lectureCategory?: 'waxing' | 'eyebrow' | 'scalp' | 'face_design' | 'skin_care' | 'body_care' | 'theory' | 'business';

  title: string;
  summary?: string;
  body: string;                  // HTML (Tiptap output)

  /** 랜딩형 페이지 구조화 섹션 (expert_program, about 등) — klead.kr/33 대응 */
  sections?: {
    key: string;                 // hero | values | leaders | curriculum | partners | contact
    title?: string;
    subtitle?: string;
    body?: string;
    imageUrl?: string;
    backgroundImage?: string;
    items?: {
      title?: string;
      subtitle?: string;
      description?: string;
      iconUrl?: string;
      imageUrl?: string;
      linkUrl?: string;
      linkLabel?: string;
      bullets?: string[];
      meta?: object;
      sortOrder: number;
    }[];
    sortOrder: number;
  }[];

  /** 페이지 노출 강사/대표 */
  relatedInstructorIds?: ObjectId[];

  thumbnail?: string;
  attachments: Attachment[];

  // lecture 전용
  videoId?: string;              // Bunny Stream video ID
  videoDuration?: number;        // seconds
  videoStatus?: 'processing' | 'ready' | 'error';
  instructorId?: ObjectId;       // ref: Instructors
  lectureMode?: 'online' | 'offline' | 'hybrid';
  chapters?: {
    title: string;
    videoId?: string;
    startTime?: number;
    sortOrder: number;
  }[];

  // 게시 옵션
  isPinned: boolean;
  isPublic: boolean;             // 비로그인 열람 (목록/요약)
  publish: PublishSchedule;

  // 가격 문의 (klead 현행)
  priceDisplay?: 'inquiry' | 'free' | 'amount';
  priceAmount?: number;

  viewCount: number;
  likeCount: number;             // denormalized
  commentCount: number;

  tagIds: ObjectId[];            // ref: Tags

  seo: SeoMeta;

  createdBy: ObjectId;
  updatedBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Indexes
{ slug: 1 }                      // unique
{ type: 1, 'publish.status': 1, createdAt: -1 }
{ type: 1, lectureCategory: 1 }
{ type: 1, contentCategory: 1 }
{ isPinned: -1, createdAt: -1 }
{ tagIds: 1 }
{ instructorId: 1 }
{ 'publish.startDt': 1, 'publish.endDt': 1 }

// Atlas Search Index: contents_search
// fields: title, summary, body, tags (autocomplete on title)
```

---

### 4.11 ContentPermissions

```typescript
{
  _id: ObjectId;
  contentId: ObjectId;
  permissionTypeId: ObjectId;

  createdAt: Date;
}

// Indexes
{ contentId: 1, permissionTypeId: 1 }  // unique
{ contentId: 1 }
{ permissionTypeId: 1 }
```

---

### 4.12 Comments

```typescript
{
  _id: ObjectId;
  contentId: ObjectId;
  userId: ObjectId;
  parentId?: ObjectId;           // 대댓글

  body: string;
  isHidden: boolean;             // 관리자 숨김

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

// Indexes
{ contentId: 1, createdAt: -1 }
{ contentId: 1, parentId: 1 }
{ userId: 1 }
```

---

### 4.13 Likes

```typescript
{
  _id: ObjectId;
  contentId: ObjectId;
  userId: ObjectId;

  createdAt: Date;
}

// Indexes
{ contentId: 1, userId: 1 }      // unique
{ contentId: 1 }
{ userId: 1 }
```

---

### 4.14 Reviews (신규 — 강의 후기)

```typescript
{
  _id: ObjectId;
  contentId: ObjectId;           // lecture only
  userId: ObjectId;

  rating: number;                // 1-5
  title?: string;
  body: string;
  images?: string[];             // R2 URLs

  isVisible: boolean;
  isFeatured: boolean;           // 홈 노출

  createdAt: Date;
  updatedAt: Date;
}

// Indexes
{ contentId: 1, createdAt: -1 }
{ contentId: 1, userId: 1 }      // unique (1인 1후기)
{ isFeatured: 1, createdAt: -1 }
```

---

### 4.15 FAQ

```typescript
{
  _id: ObjectId;
  category?: string;
  question: string;
  answer: string;                // HTML
  sortOrder: number;
  isPublished: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// Indexes
{ isPublished: 1, sortOrder: 1 }
{ category: 1, sortOrder: 1 }
```

---

### 4.16 QnA

```typescript
{
  _id: ObjectId;
  userId: ObjectId;
  contentId?: ObjectId;          // 특정 강의 관련 (optional)

  category?: string;
  title: string;
  body: string;
  attachments?: Attachment[];

  status: 'pending' | 'answered' | 'closed';
  isPrivate: boolean;            // 본인+관리자만

  answer?: {
    body: string;
    answeredBy: ObjectId;
    answeredAt: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

// Indexes
{ userId: 1, createdAt: -1 }
{ status: 1, createdAt: -1 }
{ contentId: 1 }
```

---

### 4.17 Tags

```typescript
{
  _id: ObjectId;
  name: string;                  // '왁싱'
  slug: string;

  usageCount: number;            // denormalized

  createdAt: Date;
}

// Indexes
{ slug: 1 }                      // unique
{ name: 1 }
```

---

### 4.18 Popup

```typescript
{
  _id: ObjectId;
  title: string;
  body?: string;                 // HTML
  imageUrl?: string;
  linkUrl?: string;
  linkTarget: '_self' | '_blank';

  display: {
    startDt: Date;
    endDt: Date;
    showOnce: boolean;           // 쿠키 기반 1회
    pages: string[];             // ['/', '/courses'] 빈=전체
  };

  sortOrder: number;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// Indexes
{ isActive: 1, 'display.startDt': 1, 'display.endDt': 1 }
```

---

### 4.19 SiteSettings

```typescript
{
  _id: ObjectId;
  key: string;                   // unique
  value: unknown;                // JSON
  group: 'general' | 'header' | 'footer' | 'sns' | 'seo' | 'company';
  description?: string;

  updatedBy?: ObjectId;
  updatedAt: Date;
}
```

**주요 key 예시**

| key | value 예시 |
|-----|------------|
| `header.logo` | `{ default, scroll }` |
| `header.height` | `70` |
| `main.banner` | `{ images[], autoplay }` |
| `footer.logo` | `url` |
| `sns.instagram` | `https://instagram.com/klead_official` |
| `sns.youtube` | `url` |
| `sns.kakao` | `channel url` |
| `company.info` | `{ name, ceo, email }` |
| `home.instagramFeed` | `{ enabled, username, postLimit }` |
| `theme.primaryColor` | `#7407ff` |

---

### 4.20 Payments (2차 예약)

```typescript
{
  _id: ObjectId;
  userId: ObjectId;
  subscriptionId?: ObjectId;

  provider: 'toss';
  amount: number;
  currency: 'KRW';
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

  billingKey?: string;
  orderId: string;               // unique
  paymentKey?: string;

  paidAt?: Date;
  refundedAt?: Date;
  metadata?: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4.21 WebhookLogs (2차 예약)

```typescript
{
  _id: ObjectId;
  source: 'toss' | 'bunny';
  eventType: string;
  payload: unknown;
  status: 'received' | 'processed' | 'failed';
  error?: string;
  processedAt?: Date;

  createdAt: Date;
}

// TTL: 90일
{ createdAt: 1 }  // expireAfterSeconds: 7776000
```

---

### 4.22 ContentHistory (2차 예약)

```typescript
{
  _id: ObjectId;
  contentId: ObjectId;
  version: number;
  snapshot: object;              // Contents 전체 복사
  changedBy: ObjectId;
  changeNote?: string;
  diff?: object;

  createdAt: Date;
}
```

---

### 4.23 AuditLogs (2차 예약)

```typescript
{
  _id: ObjectId;
  userId: ObjectId;
  action: string;                // 'content.update'
  resource: string;              // 'Contents'
  resourceId: ObjectId;
  before?: object;
  after?: object;
  ip?: string;

  createdAt: Date;
}
```

---

## 5. Atlas Search 인덱스

### contents_search

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "title": {
        "type": "string",
        "analyzer": "lucene.nori",
        "searchAnalyzer": "lucene.nori"
      },
      "summary": {
        "type": "string",
        "analyzer": "lucene.nori"
      },
      "body": {
        "type": "string",
        "analyzer": "lucene.nori"
      },
      "type": { "type": "token" },
      "lectureCategory": { "type": "token" },
      "contentCategory": { "type": "token" },
      "tagNames": {
        "type": "string",
        "analyzer": "lucene.nori"
      }
    }
  }
}
```

> 검색 시 `tagNames`는 Contents 조회 pipeline에서 Tags `$lookup` 후 denormalize

---

## 6. 집계 패턴 (Analytics)

### 회원 통계

```javascript
// 신규 회원 (기간별)
db.users.aggregate([
  { $match: { createdAt: { $gte: start, $lte: end }, status: 'active' } },
  { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Seoul' } }, count: { $sum: 1 } } }
])
```

### 인기 강의

```javascript
db.contents.aggregate([
  { $match: { type: 'lecture', 'publish.status': 'published', deletedAt: null } },
  { $sort: { viewCount: -1 } },
  { $limit: 10 },
  { $project: { title: 1, viewCount: 1, likeCount: 1, thumbnail: 1 } }
])
```

---

## 7. 인덱스 체크리스트 (MVP)

| 컬렉션 | 인덱스 | 용도 |
|--------|--------|------|
| Users | authProvider+authProviderId | 로그인 |
| Contents | slug | URL 라우팅 |
| Contents | type+publish.status+createdAt | 목록 |
| MenuContents | menuId+sortOrder | 메뉴별 콘텐츠 |
| Subscriptions | userId+status | 권한 조회 |
| UserPermissions | userId | 권한 조회 |
| ContentPermissions | contentId | 접근 검증 |
| Likes | contentId+userId | 중복 방지 |

---

## 8. 마이그레이션 전략

1. `scripts/seed/` — PermissionTypes, Programs, Menus, SiteSettings
2. imweb 기존 URL → slug 매핑 JSON (`migrations/url-map.json`)
3. 버전 관리: `schemaMigrations` 컬렉션

```typescript
{
  version: number;
  name: string;
  appliedAt: Date;
}
```

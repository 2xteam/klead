# 전문가 과정 페이지 매핑 (klead.kr/33)

## 페이지 요소 → DB 매핑

| 페이지 섹션 | DB 위치 |
|-------------|---------|
| ABOUT KLEAD / 히어로 카피 | `Contents.sections[key=hero]` |
| 핵심가치 4카드 | `Contents.sections[key=values].items` |
| 김보령·서현정 대표 | `Instructors` + `sections[key=leaders]` + `relatedInstructorIds` |
| 4단계 성장 구조 | `Contents.sections[key=curriculum].items` |
| 파트너 로고 | `Contents.sections[key=partners].items[].imageUrl` |
| Contact (메일/인스타/카톡) | `sections[key=contact]` + `SiteSettings` |
| 메뉴 "전문가 과정" | `Menus(slug=expert)` → `MenuContents` → Content |

## Content 문서

- **slug**: `expert-program`
- **type**: `content`
- **contentCategory**: `expert_program`
- **isPublic**: true
- **priceDisplay**: `inquiry`

## 스키마 확장

`Contents`에 추가:

- `sections[]` — 랜딩 페이지 구조화 블록
- `relatedInstructorIds[]` — 페이지 노출 강사

## 시드

```bash
npm run seed:expert
```

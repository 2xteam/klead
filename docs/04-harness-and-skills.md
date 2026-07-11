# 개발 하네스 & 스킬 설정 가이드

---

## 1. Superpowers 설치

Cursor Agent 채팅에서:

```text
/add-plugin superpowers
```

### 워크플로 명령 (수동 호출)

| 단계 | 명령/스킬 |
|------|-----------|
| 요구사항 정리 | `brainstorming` |
| 구현 계획 | `writing-plans` |
| 배치 실행 | `executing-plans` 또는 `subagent-driven-development` |
| TDD | `test-driven-development` |
| 디버깅 | `systematic-debugging` |
| 마무리 | `finishing-a-development-branch` |

---

## 2. Agent Memory 설치

```bash
npm install -g @agentmemory/agentmemory
agentmemory connect cursor
agentmemory install-skills
```

### 세션 규칙

- **시작**: `agent-memory context` 로 이전 작업 로드
- **작업 중**: 결정·스키마 변경·API 변경을 daily log에 기록
- **종료**: scratchpad 정리, long_term에 아키텍처 결정만 보관

### 프로젝트 메모리 주제

| topic | 내용 |
|-------|------|
| `klead-schema` | DB 스키마 변경 이력 |
| `klead-design` | 디자인 토큰·컴포넌트 결정 |
| `klead-api` | API 계약 변경 |
| `klead-blockers` | 미해결 이슈 |

---

## 3. humanizer-ui 스킬 (프로젝트 로컬)

경로: `.cursor/skills/humanizer-ui/SKILL.md`

**트리거**: UI 컴포넌트, 페이지, 레이아웃, 스타일 작업 시

**핵심 규칙**:
- `docs/03-design-system-klead.md` 토큰 준수
- shadcn/ui 기본 aesthetic 사용 금지
- Inter, Roboto, purple-gradient-on-white 금지
- 실제 klead.kr 스크린샷을 reference로 첨부
- 컴포넌트 완성 후 "AI 티 체크리스트" 자가 검수

---

## 4. Cursor Rules (권장)

`.cursor/rules/klead.mdc`:

```yaml
---
description: KLEAD 프로젝트 공통 규칙
globs: ["src/**"]
alwaysApply: true
---
- TypeScript strict, any 금지
- API는 Zod 검증 필수
- 권한은 lib/permissions/canAccess.ts 단일 진입점
- UI는 docs/03-design-system-klead.md 준수
- 커밋 전: lint + typecheck + test
```

---

## 5. 개발 전·중·후 산출물

### 개발 전 (Gate 0)

- [x] 개발 계획서 (`docs/01-development-plan.md`)
- [x] DB 스키마 (`docs/02-database-schema.md`)
- [x] 디자인 스펙 (`docs/03-design-system-klead.md`)
- [ ] API OpenAPI 초안 (`docs/api/openapi.yaml`)
- [ ] klead.kr 전체 스크린샷 (`docs/design/reference/`)

### 개발 중

- agent-memory daily log
- ADR (`docs/adr/NNN-title.md`) — 주요 결정마다

### 개발 후 (Gate 1)

- 관리자 매뉴얼 (`docs/manual/admin.md`)
- 회원 가이드 (`docs/manual/member.md`)
- 테스트 리포트 (`docs/testing/report.md`)
- E2E 커버리지 리포트

---

## 6. Git 브랜치 전략

```
main          ← 프로덕션
develop       ← 통합
feature/*     ← 기능 단위 (Phase별)
hotfix/*      ← 긴급 수정
```

PR 필수 체크:
- CI green
- 1+ reviewer (가능 시)
- 스크린샷 (UI 변경 시)

---

## 7. CI 파이프라인

```yaml
# .github/workflows/ci.yml (예정)
- pnpm lint
- pnpm typecheck
- pnpm test:unit
- pnpm test:e2e (PR only, chromium)
- playwright screenshot diff (UI PR)
```

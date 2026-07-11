# 시드 데이터 가이드

실행:

```bash
npm run seed
```

## 테스트 계정 (authProvider: test)

| 이메일 | 역할 | 권한 |
|--------|------|------|
| admin@klead.test | admin | 전체 |
| basic@klead.test | member | Basic 구독 (입문 8종) |
| premium@klead.test | member | Premium 구독 |
| master@klead.test | member | Master 구독 (전체 Permission) |
| waxing@klead.test | member | Waxing_Basic + Waxing_Master 개별 |
| scalp@klead.test | member | Scalp_Basic + Scalp_Master 개별 |
| guest@klead.test | member | 구독/권한 없음 |

## 프로그램

| code | 포함 권한 |
|------|-----------|
| basic | *_Basic 8종 |
| premium | Basic + 주요 *_Master |
| master | PermissionTypes 전체 |

## 강의 샘플

종목별 Basic/Master 강의가 ContentPermissions와 MenuContents로 연결됨.
videoId는 `seed-video-*` placeholder (Bunny 연동 전).

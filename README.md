# SSAMANTLE Web Client

싸맨들 단어 추측 게임의 프론트엔드 웹 클라이언트입니다. React + TypeScript 기반으로, 게임 호스트와 참가자 모두가 사용하는 UI를 제공합니다.

## What this app does

- 관리자 화면: 오늘의 단어 설정, 게임 시간 설정, 게임 이름 설정, 초대 화면, 참가자 관리, 게임 시작/종료, 실시간 리더보드 확인
- 사용자 화면: 초대 링크로 접속, 서버가 부여한 사용자명 확인, 참가자 목록 확인, 단어 제출, 내 순위와 제출 기록 확인
- 서버 연동: 단어 임베딩, 제출 관리, 게임 기록 관리, 스코어보드 계산은 백엔드가 담당하고, 이 앱은 이를 표시하고 조작하는 역할을 맡습니다
- 저장소 구조: 전형적인 3-tier 구성을 기준으로 동작하며, Redis 캐시를 통해 임베딩 결과와 스코어보드를 빠르게 조회합니다

## Tech Stack

- React 19
- TypeScript 4.9
- Create React App
- Tailwind CSS 3
- `@ssamantle/sdk-typescript`

## Run locally

1. 의존성 설치

```bash
npm install
```

2. 개발 서버 실행

```bash
npm start
```

기본적으로 [http://localhost:3000](http://localhost:3000)에서 열립니다.

주의: 이 클라이언트는 백엔드 API를 `http://<현재 호스트>:8000`으로 호출합니다. 로컬에서 실행할 때는 백엔드도 같은 호스트의 `8000` 포트에서 실행되어야 합니다.

## Tests

일회성 실행:

```bash
npm test
```

watch 모드 실행:

```bash
npm run test:watch
```

## Production build

기본 빌드는 `build/` 폴더에 생성됩니다.

```bash
npm run build
```

정적 배포용으로 `dist/` 출력을 원하면 아래처럼 실행할 수 있습니다.

```bash
BUILD_PATH=dist npm run build
```

## Notes

- GitHub Actions는 `main` 브랜치 푸시 시 정적 빌드를 수행하고 GitHub Pages에 배포합니다.
- Docker 이미지는 기본적으로 빌드 산출물만 포함하도록 구성되어 있습니다.

# File Extension Blocker - Frontend

React 기반의 파일 확장자 차단 시스템 프론트엔드 프로젝트입니다.

## 기술 스택

- React
- Axios
- CSS Modules

## 주요 기능

- 고정 확장자 체크박스 기반 차단
- 커스텀 확장자 추가/삭제
- 파일 업로드 차단/허용
- 업로드 시도 로그 기록

## 실행 방법

### 1. 환경 변수 설정

루트에 `.env` 파일 생성

```
REACT_APP_API_URL=http://localhost:8000
```

### 2. 실행

```bash
npm install
npm run dev
```

## 폴더 구조

```
front/
├── node_modules/              # 설치된 패키지들
├── public/                    # 정적 파일 (favicon, index.html 등)
├── src/                       # 소스코드 폴더
│   ├── components/            # 컴포넌트
│   │   ├── Modal.css          # 모달 관련 CSS
│   │   ├── Modal.js           # 모달 컴포넌트 JS
│   ├── App.css                # 전체 앱 스타일
│   ├── App.jsx                # 메인 컴포넌트
│   ├── index.js               # 앱 진입점
├── .env                       # 환경변수 파일 (API URL 설정)
├── .gitignore                # Git에서 제외할 파일/폴더 목록
├── package.json              # 프로젝트 정보 및 의존성
├── package-lock.json         # 정확한 의존성 버전 고정
├── README.md                 # 프론트엔드 프로젝트 설명 문서
```

## 테스트용 커스텀 확장자

- zip
- apk
- dll

## 비고

- 업로드 시도 로그는 로컬 스토리지에 저장됩니다.
- 고정/커스텀 확장자는 DB에서 관리되며 백엔드와 연동되어 있습니다.

# SpringBootBoard Project Status

## 프로젝트 개요

Spring Boot 기반 게시판 애플리케이션 - 전통적인 MVC와 현대적인 SPA 아키텍처가 공존하는 하이브리드 구조

### 기술 스택

#### 백엔드
- **Framework**: Spring Boot 3.4.11
- **Language**: Java 21
- **ORM**: MyBatis
- **Database**: MySQL
- **Security**: Spring Security 6.x
- **Port**: 8090

#### 프론트엔드 (전통)
- **Template Engine**: Thymeleaf 3.x
- **JavaScript**: jQuery 3.6.0
- **UI Framework**: Bootstrap 5.3.0
- **Rich Text Editor**: Summernote 0.8.18
- **Modal**: SweetAlert2 11.x

#### 프론트엔드 (모던)
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.6.3
- **Build Tool**: Vite 5.4.10
- **Editor**: TipTap
- **HTTP Client**: Axios 1.7.7
- **Dev Port**: 3000

## 현재 상태 (2025-10-29)

### 작동 중인 기능
- ✅ 게시글 CRUD (Thymeleaf + Spring MVC)
- ✅ 댓글/대댓글 시스템 (jQuery AJAX)
- ✅ 사용자 인증/인가 (Spring Security)
- ✅ 파일 업로드 (REST API)
- ✅ React 기반 에디터 컴포넌트

### 발견된 문제점

#### 🔴 Priority 1 (치명적 - 즉시 수정 필요)

1. **Vite 프록시 포트 오류**
   - 위치: `frontend/vite.config.ts:10`
   - 문제: 프록시가 8080으로 설정되어 있으나 서버는 8090에서 실행
   - 영향: React 개발 환경에서 백엔드 API 호출 실패
   - 해결: `target: 'http://localhost:8090'`으로 변경

2. **동기 파일 업로드 처리**
   - 위치: `src/main/java/com/kosa/board/api/service/FileStorageService.java:46-55`
   - 문제: 여러 파일을 순차적으로 처리 (blocking I/O)
   - 영향: 5개 파일 업로드 시 5배 느림
   - 해결: `CompletableFuture` 또는 `@Async`로 병렬 처리

3. **순차 AJAX 호출**
   - 위치: `src/main/resources/templates/detail.html:496-498`
   - 문제: 댓글별 대댓글 수를 순차적으로 로드
   ```javascript
   comments.forEach(comment => {
       loadReplyCount(comment.id);  // 10개 댓글 = 10번 순차 요청
   });
   ```
   - 해결: `Promise.all()`로 병렬 처리

#### 🟡 Priority 2 (성능 개선)

4. **불일치한 UX 패턴**
   - 댓글 삭제: 전체 페이지 리다이렉트 (`location.href`)
   - 대댓글 삭제: AJAX 호출 (올바른 방식)
   - 해결: 모든 CRUD를 AJAX로 통일

5. **에러 처리 부족**
   - 타임아웃 미설정
   - 재시도 로직 없음
   - 로딩 상태 표시 없음
   - 취소 토큰 미지원 (React 업로드)

6. **요청 취소 불가**
   - 위치: `frontend/src/hooks/useFileUpload.ts:20-45`
   - 문제: 대용량 파일 업로드 중 컴포넌트 언마운트 시 메모리 누수
   - 해결: Axios CancelToken 또는 AbortController 사용

#### 🟢 Priority 3 (아키텍처 개선)

7. **인라인 JavaScript**
   - 모든 JS 코드가 `<script>` 태그 내부에 존재
   - 테스트 불가능, 재사용 불가능
   - 해결: 별도 `.js` 파일로 분리

8. **전역 변수 남용**
   - `boardId`, `token`, `header` 등이 전역 스코프에 노출
   - 해결: 모듈 패턴 또는 IIFE 사용

9. **타입 안정성 부족**
   - jQuery 코드에 타입 체크 없음
   - 해결: JSDoc 또는 TypeScript 마이그레이션

#### 🔵 Priority 4 (보안)

10. **CSRF 토큰 누락**
    - React 앱이 CSRF 토큰을 포함하지 않음
    - 위치: `frontend/src/services/fileUpload.ts`

11. **잠재적 XSS 취약점**
    - jQuery `.html()` 사용 시 사용자 입력 직접 렌더링
    - 위치: `detail.html` 댓글 렌더링 부분

12. **클라이언트 사이드 비밀번호 노출**
    - 위치: `src/main/resources/templates/update.html:109`

## 프로젝트 구조

```
board/
├── src/main/
│   ├── java/com/kosa/board/
│   │   ├── api/                    # REST API (React용)
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   └── service/
│   │   ├── config/                 # Security, Web, DataInitializer
│   │   ├── controller/             # MVC Controllers (Thymeleaf용)
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── repository/             # MyBatis Mappers
│   │   └── service/
│   └── resources/
│       ├── mapper/                 # MyBatis XML
│       ├── static/
│       │   └── react/              # React 빌드 출력
│       └── templates/              # Thymeleaf HTML
│           ├── list.html           # 게시글 목록
│           ├── detail.html         # 게시글 상세 (가장 복잡)
│           ├── save.html           # 게시글 작성
│           ├── update.html         # 게시글 수정
│           ├── login.html          # 로그인
│           ├── signup.html         # 회원가입
│           └── editor.html         # React 에디터 로더
├── frontend/                       # React 애플리케이션
│   ├── src/
│   │   ├── components/
│   │   │   └── TiptapEditor.tsx
│   │   ├── hooks/
│   │   │   └── useFileUpload.ts
│   │   ├── services/
│   │   │   └── fileUpload.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts              # ⚠️ 포트 8080 → 8090 수정 필요
│   └── tsconfig.json
└── uploads/                        # 업로드 파일 저장소
```

## API 엔드포인트

### MVC Routes (Server-Side Rendering)
```
GET  /list              → 게시글 목록
GET  /{id}              → 게시글 상세
GET  /save              → 게시글 작성 폼
POST /save              → 게시글 저장
GET  /update/{id}       → 게시글 수정 폼
POST /update/{id}       → 게시글 업데이트
GET  /delete/{id}       → 게시글 삭제
GET  /login             → 로그인 폼
POST /login             → 로그인 처리
GET  /signup            → 회원가입 폼
POST /signup            → 회원가입 처리
```

### AJAX APIs (jQuery용)
```
POST /comment/save                  → 댓글 저장
GET  /comment/list/{boardId}        → 댓글 목록
POST /comment/delete/{id}           → 댓글 삭제 (⚠️ 리다이렉트)
POST /reply/save                    → 대댓글 저장
GET  /reply/list/{commentId}        → 대댓글 목록
POST /reply/delete/{id}             → 대댓글 삭제
```

### REST APIs (React용)
```
GET    /api/boards                  → 게시글 목록
GET    /api/boards/{id}             → 게시글 조회
POST   /api/boards                  → 게시글 생성
PUT    /api/boards/{id}             → 게시글 수정
DELETE /api/boards/{id}             → 게시글 삭제
POST   /api/files/upload            → 단일 파일 업로드
POST   /api/files/upload-multiple   → 다중 파일 업로드
```

## Git 상태

**Current Branch**: `claude/login-comment-feature-011CUZ9GdY86bVtr3uZeMnMK`
**Main Branch**: `main`

### 최근 커밋
- `403f0e6` - Enhance UI with navigation bars, breadcrumbs, and improved buttons
- `04562be` - Fix database column sizes and CSRF token issues
- `575f171` - Add reply system with Bootstrap 5, Summernote 2, and SweetAlert2
- `7ac9cc4` - Add user authentication, comment system, and Spring Security 6.x integration
- `3c14264` - Enhance border UI with modern gradient design and interactive effects

### Modified Files (작업 중)
- `build.gradle`
- Security 관련: `SecurityConfig.java`, `DataInitializer.java`, `WebConfig.java`
- Controllers: `BoardController.java`, `CommentController.java`, `UserController.java`, etc.
- DTOs, Repositories, Services
- MyBatis Mappers
- Thymeleaf Templates

### Untracked Files
- `frontend/` - React 애플리케이션
- `src/main/java/com/kosa/board/api/` - REST API 레이어
- `src/main/resources/templates/editor.html`
- `uploads/` - 업로드된 이미지 파일들
- `../.idea/` - IntelliJ 설정

## 권장 조치 사항

### 즉시 수정 (오늘)
1. ✅ Vite 프록시 포트 수정 (8080 → 8090)
2. ⬜ 댓글 삭제를 AJAX로 변경
3. ⬜ 대댓글 수 로딩을 병렬 처리로 변경

### 이번 주
4. ⬜ 파일 업로드 비동기 처리 구현
5. ⬜ CSRF 토큰을 React 앱에 추가
6. ⬜ 모든 AJAX 호출에 로딩 상태 추가
7. ⬜ 에러 처리 및 재시도 로직 구현

### 다음 스프린트
8. ⬜ 인라인 JavaScript 외부 파일로 분리
9. ⬜ 댓글 시스템을 React 컴포넌트로 마이그레이션
10. ⬜ WebSocket으로 실시간 업데이트 구현
11. ⬜ 단위 테스트 작성

## 실행 방법

### 백엔드
```bash
cd board
./gradlew bootRun
# 또는
./gradlew build && java -jar build/libs/board-*.jar
```
서버: http://localhost:8090

### 프론트엔드 (React 개발)
```bash
cd frontend
npm install
npm run dev
```
개발 서버: http://localhost:3000

### 프론트엔드 (React 빌드)
```bash
cd frontend
npm run build
```
빌드 출력: `src/main/resources/static/react/`

## 주의사항

1. **포트 충돌**: Spring Boot(8090), React Dev Server(3000)
2. **CSRF**: Thymeleaf 템플릿은 자동으로 CSRF 토큰 포함하지만 React는 수동 설정 필요
3. **파일 업로드**: `uploads/` 디렉토리 권한 확인 필요
4. **데이터베이스**: MySQL 연결 정보는 `application.properties`에 설정

## 연락처 및 문서

- 프로젝트 리포지토리: (추가 필요)
- API 문서: (추가 필요)
- 이슈 트래커: (추가 필요)

---

**마지막 업데이트**: 2025-10-29
**작성자**: Claude Code Analysis

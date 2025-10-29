# 프로젝트 개선 계획 및 진행 현황

## 📊 전체 개선 목표

Spring Boot + React 게시판 프로젝트를 **SOLID 원칙**, **Clean Architecture**, **모던 UI**로 업그레이드

---

## 🔧 진행 중인 작업

### Phase 1: 백엔드 SOLID 리팩토링 (진행 중)

**Codex로 외주 중 - spring-react-guidelines + springboot-official 강제**

#### 1.1 BoardService 통합
- [ ] BoardService.java 레거시 코드를 BoardApiService로 통합
- [ ] FileStorageService 활용하여 파일 IO 완전 분리
- [ ] System.out.println() → Logger로 변경

#### 1.2 N+1 쿼리 문제 해결
- [ ] CommentService.save() → 저장된 엔티티 ID 반환
- [ ] ReplyService.save() → 저장된 엔티티 ID 반환
- [ ] Controller에서 재조회 제거

#### 1.3 예외 처리 표준화
- [ ] 모든 not-found 시나리오에서 ResourceNotFoundException 사용
- [ ] CommentService/ReplyService에 findByIdOrThrow() 추가
- [ ] GlobalExceptionHandler에서 통일된 처리

#### 1.4 트랜잭션 경계 명확화
- [ ] @Transactional(readOnly = true) for read operations
- [ ] @Transactional(propagation = REQUIRED) for write operations
- [ ] 예외 발생 시 rollback 정확히 지정

#### 1.5 SOLID 원칙 준수
- **Single Responsibility**: 각 서비스 계층 책임 단일화
- **Open/Closed**: API 설계 확장성 유지
- **Liskov Substitution**: Exception 계층구조 준수
- **Interface Segregation**: DTO 분리 유지
- **Dependency Inversion**: 생성자 주입 + 인터페이스 의존

---

### Phase 2: 프론트엔드 SOLID + 모던 UI (진행 중)

**Codex로 외주 중 - spring-react-guidelines + react 강제**

#### 2.1 보안 개선
- [ ] XSS 취약점 제거 (dangerouslySetInnerHTML → DOMPurify)
- [ ] 모든 HTML 렌더링 sanitization
- [ ] CSRF 토큰 자동 전송

#### 2.2 타입 안정성
- [ ] any 타입 완전 제거
- [ ] Board, Comment, Reply 인터페이스 정의
- [ ] API 응답 타입 명시

#### 2.3 상태 관리 개선
- [ ] BoardForm: 4개 useState → 1개 통합
- [ ] useCallback 최적화
- [ ] useMemo 적절히 사용

#### 2.4 에러 처리 표준화
- [ ] useErrorHandler 커스텀 훅
- [ ] 모든 페이지에서 에러 상태 관리
- [ ] Swal로 사용자 친절한 메시지

#### 2.5 컴포넌트 분리 (Single Responsibility)
- [ ] ProtectedRoute.tsx 추출
- [ ] Layout.tsx (Header 포함)
- [ ] Navigation 분리
- [ ] 각 컴포넌트 단일 책임

#### 2.6 Tailwind CSS + 모던 UI
- [ ] 모든 인라인 스타일 제거
- [ ] Tailwind 클래스 적용
- [ ] 반응형 디자인 (mobile-first)
- [ ] 다크모드 지원
- [ ] 일관된 spacing, 색상, 그림자

**UI 개선 항목**:
```
Header/Navigation      → 현대적 스타일, 로고 추가
BoardList             → 카드 레이아웃, 썸네일
BoardDetail/Form      → 깔끔한 레이아웃
Comments/Replies      → 깔끔한 리스트, 타임스탬프
Forms                 → 폼 검증 피드백
Loading/Error         → 스피너, 에러 메시지
```

---

## 📦 설치된 패키지

```
✅ Tailwind CSS        - CSS 프레임워크
✅ PostCSS             - CSS 전처리
✅ Autoprefixer        - 벤더 프리픽스
✅ DOMPurify           - XSS 방지
✅ class-variance-authority - CSS-in-JS 헬퍼
✅ clsx                - className 헬퍼
✅ lucide-react        - 아이콘 라이브러리
```

---

## 📁 생성된 파일

```
frontend/
├── tailwind.config.js       (✅ 생성)
├── postcss.config.js        (✅ 생성)
├── src/index.css            (✅ Tailwind 통합)
└── package.json             (✅ 패키지 설치)
```

---

## 🎯 Phase 3: 통합 테스트 및 배포 (예정)

- [ ] 백엔드 단위 테스트
- [ ] 프론트엔드 컴포넌트 테스트
- [ ] E2E 테스트
- [ ] 성능 측정
- [ ] 빌드 및 배포

---

## 📊 SOLID 원칙 준수도

### 백엔드 (개선 전 → 개선 후)
| 원칙 | 전 | 후 | 목표 |
|------|----|----|------|
| S (SRP) | ⚠️⚠️ | ✅ | BoardService 통합 |
| O (OCP) | ✅ | ✅ | 유지 |
| L (LSP) | ✅ | ✅ | 유지 |
| I (ISP) | ✅ | ✅ | 유지 |
| D (DIP) | ✅ | ✅ | 유지 |
| **총평** | **6.5/10** | **8/10** | **SOLID 완수** |

### 프론트엔드 (개선 전 → 개선 후)
| 원칙 | 전 | 후 | 목표 |
|------|----|----|------|
| S (SRP) | ⚠️ | ✅ | 컴포넌트 분리 |
| O (OCP) | ✅ | ✅ | 유지 |
| L (LSP) | ✅ | ✅ | 유지 |
| I (ISP) | ✅ | ✅ | 유지 |
| D (DIP) | ✅ | ✅ | 유지 |
| **UI/UX** | **기본** | **모던** | **Tailwind 적용** |
| **보안** | ⚠️ (XSS) | ✅ | DOMPurify |
| **타입** | ⚠️ (any) | ✅ | 명시적 타입 |
| **총평** | **7/10** | **9/10** | **현대적 표준** |

---

## 🚀 Codex 작업 명령어

### 백엔드
```bash
codex exec -m gpt-5 --config model_reasoning_effort="high" --sandbox workspace-write \
  "Read ~/.claude/skills/spring-react-guidelines/SKILL.md and
   ~/.claude/skills/springboot-official/SKILL.md first, then refactor..."
```

### 프론트엔드
```bash
codex exec -m gpt-5 --config model_reasoning_effort="high" --sandbox workspace-write \
  "Read ~/.claude/skills/spring-react-guidelines/SKILL.md and
   ~/.claude/skills/react/SKILL.md first, then refactor..."
```

---

## 📝 체크리스트

### 백엔드
- [ ] BoardService 통합
- [ ] N+1 쿼리 해결
- [ ] 예외 처리 표준화
- [ ] 트랜잭션 경계 명확화
- [ ] Logger 적용
- [ ] 코드 리뷰

### 프론트엔드
- [ ] XSS 취약점 제거
- [ ] any 타입 제거
- [ ] 상태 관리 개선
- [ ] 에러 처리 표준화
- [ ] 컴포넌트 분리
- [ ] Tailwind 전체 적용
- [ ] 모바일 반응형 확인
- [ ] 다크모드 테스트

### 배포
- [ ] 테스트 작성
- [ ] 성능 측정
- [ ] 보안 검증
- [ ] 빌드 성공 확인
- [ ] 배포

---

## 💡 핵심 개선 사항 요약

### 백엔드
1. **단일 책임** → BoardService 통합, 역할 명확화
2. **성능** → N+1 쿼리 제거, 효율적 조회
3. **안정성** → 표준화된 예외 처리, 명확한 트랜잭션
4. **유지보수** → 로깅, 깔끔한 코드

### 프론트엔드
1. **보안** → XSS 방지, 입력 sanitization
2. **타입** → 명시적 인터페이스, any 제거
3. **UX** → 모던 디자인, 반응형
4. **유지보수** → 컴포넌트 분리, 표준화된 패턴

---

## 📅 예상 일정

| Phase | 항목 | 상태 | 예상 시간 |
|-------|------|------|---------|
| 1 | 백엔드 리팩토링 | 🔄 진행 중 | 1-2시간 |
| 2 | 프론트엔드 리팩토링 | 🔄 진행 중 | 1-2시간 |
| 3 | 테스트 및 배포 | ⏳ 예정 | 30분-1시간 |

---

마지막 업데이트: 2025-10-29
스킬 지식 주입: ✅ spring-react-guidelines, springboot-official, react

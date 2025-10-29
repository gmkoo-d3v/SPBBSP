# 프로젝트 개선 계획

## 1단계: 백엔드 SOLID 리팩토링
### 목표
- BoardService 중복 제거
- CommentService 비즈니스 로직 추가
- 예외 처리 표준화
- N+1 쿼리 최적화

### 우선순위
1. BoardService → BoardApiService 통합
2. CommentController의 N+1 문제 해결
3. 파일 처리 로직 FileStorageService로 완전 분리
4. 예외 처리 일관성 (모두 ResourceNotFoundException 사용)
5. System.out.println() → Logger로 변경

## 2단계: 프론트엔드 SOLID 리팩토링
### 목표
- XSS 보안 취약점 제거
- any 타입 제거
- 상태 관리 개선
- 에러 처리 표준화

### 우선순위
1. dangerouslySetInnerHTML 제거 (DOMPurify)
2. any 타입 → 명확한 타입 정의
3. BoardForm 상태 통합
4. 에러 처리 표준화

## 3단계: 모던 UI 적용
### 목표
- Tailwind CSS + Shadcn/UI 적용
- 반응형 디자인
- 다크모드 지원
- 접근성 개선

### 구현
1. 패키지 설치
2. 레이아웃 개선
3. 컴포넌트 리스타일링
4. 폼 개선
5. 테이블/리스트 개선

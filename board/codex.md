# Project Health Snapshot

## 1. Critical Issues
- **SQL Injection**: `Board.findById` uses string interpolation (`${id}`) in `src/main/resources/mapper/board-mapper.xml`, allowing malicious input to alter queries.
- **Hardcoded Secrets**: Database credentials and JWT secret are committed in `src/main/resources/application.yml`, risking credential leakage.
- **Default Admin Account**: `DataInitializer` creates `admin/1234` on startup without safeguards, leaving the system exposed.
- **Plaintext Board Passwords**: Board passwords are stored without hashing in `BoardApiService`/`BoardDTO`.

## 2. High-Priority Improvements
- Parameterize MyBatis queries (`#{id}`) and review all mapper files for similar patterns.
- Load sensitive configuration from environment-specific sources (profiles, `application-*.yml`, or secret management) and exclude secrets from VCS.
- Remove automatic creation of privileged accounts or randomize credentials with secure distribution to operators.
- Hash board passwords (e.g., `BCryptPasswordEncoder`) or remove the concept if not essential.

## 3. Structural & Maintainability Concerns
- **DTO Design**: `BoardDTO` mixes persistence model with web concerns (`MultipartFile`), complicating serialization and testing.
- **Repository Hygiene**: Build output (`build/`), uploaded assets (`uploads/`), and `frontend/node_modules/` are tracked, inflating the repo and risking conflicts.
- **Testing Gap**: `src/test` is empty; no automated coverage for authentication, board CRUD, or file uploads.

### Suggested Actions
- Introduce clear entity/DTO separation or leverage MyBatis mappers tailored to persistence objects.
- Add proper `.gitignore` rules and relocate runtime artifacts outside version control.
- Establish baseline integration/unit tests (Spring Boot slice tests, MyBatis mapper tests, front-end component tests).

## 4. Operational Follow-Ups
- Document environment setup with externalized secrets and migration steps (e.g., `.env`, secrets manager).
- Review async file upload error handling; ensure failures propagate correctly and add monitoring/logging.
- Consider rate limiting/auth policy refinements for file endpoints to mitigate abuse.

---

Maintaining focus on security fixes first will stabilize the deployment surface. Follow with refactoring and test coverage to sustain long-term quality.

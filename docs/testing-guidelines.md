# Testing Guidelines: To Do App

All new features must include appropriate tests. Tests must be maintainable, isolated, and follow the best practices outlined in this guide.

---

## Unit Tests

- **Framework**: Jest
- **Purpose**: Test individual functions and React components in isolation.
- **Naming convention**: `*.test.js` or `*.test.ts`
- **File naming**: Match the name of the file under test (e.g., `app.test.js` for testing `app.js`).

### Directory Structure

| Scope | Location |
|---|---|
| Backend unit tests | `packages/backend/__tests__/` |
| Frontend unit tests | `packages/frontend/src/__tests__/` |

---

## Integration Tests

- **Framework**: Jest + Supertest
- **Purpose**: Test backend API endpoints with real HTTP requests.
- **Naming convention**: `*.test.js` or `*.test.ts`
- **File naming**: Name files based on what they test (e.g., `todos-api.test.js` for TODO API endpoints).

### Directory Structure

| Scope | Location |
|---|---|
| Backend integration tests | `packages/backend/__tests__/integration/` |

---

## End-to-End (E2E) Tests

- **Framework**: Playwright (required — do not use alternatives)
- **Purpose**: Test complete UI workflows through browser automation.
- **Naming convention**: `*.spec.js` or `*.spec.ts`
- **File naming**: Name files based on the user journey being tested (e.g., `todo-workflow.spec.js`).

### Directory Structure

| Scope | Location |
|---|---|
| E2E tests | `tests/e2e/` |

### E2E Rules

- Use **one browser only** for all Playwright tests.
- Use the **Page Object Model (POM)** pattern for maintainability.
- Limit E2E tests to **5–8 critical user journeys** — focus on happy paths and key edge cases, not exhaustive coverage.

---

## Port Configuration

Always use environment variables with sensible defaults for port configuration to allow CI/CD workflows to dynamically detect ports.

- **Backend**: `const PORT = process.env.PORT || 3030;`
- **Frontend**: React's default port is `3000`, but can be overridden with the `PORT` environment variable.

---

## General Principles

- **Isolation**: All tests must be fully isolated and independent. Each test must set up its own data and must not rely on the state or output of other tests.
- **Setup and teardown**: Tests must use setup and teardown hooks (e.g., `beforeEach`, `afterEach`, `beforeAll`, `afterAll`) to ensure they succeed on multiple consecutive runs.
- **Coverage**: All new features must include appropriate unit, integration, and/or E2E tests depending on the scope of the change.
- **Maintainability**: Tests should be readable, focused, and follow established patterns — avoid duplication and over-engineering in test code.

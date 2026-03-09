# Coding Guidelines: To Do App

These guidelines define the coding style and quality principles for the To Do App. All contributors should follow these practices to keep the codebase consistent, readable, and maintainable.

---

## Code Formatting

Consistent formatting makes code easier to read and review. Follow these rules across all files in the project:

- **Indentation**: Use 2 spaces for indentation. Do not use tabs.
- **Quotes**: Use single quotes (`'`) in backend (Node.js/CommonJS) files and double quotes or JSX conventions in frontend (React) files, consistent with existing code.
- **Semicolons**: Always end statements with a semicolon.
- **Line length**: Keep lines under 100 characters where practical. Break long expressions across multiple lines with consistent indentation.
- **Trailing whitespace**: Do not leave trailing whitespace on any line.
- **Blank lines**: Use a single blank line to separate logical sections within a function or module. Use two blank lines between top-level declarations where appropriate.
- **Braces**: Always use braces for `if`, `for`, and `while` blocks, even when the body is a single line.

---

## Import Organization

Organize imports in a consistent order to make dependencies easy to scan:

1. **Node.js built-in modules** (e.g., `path`, `fs`)
2. **Third-party packages** (e.g., `express`, `cors`, `react`)
3. **Internal modules / local files** (e.g., `./App.css`, `../utils`)

Separate each group with a blank line. In the frontend, CSS imports should come after React and third-party imports, as seen in `App.js`:

```js
import React, { useState, useEffect } from 'react';
import './App.css';
```

In the backend, use CommonJS `require` in the same order:

```js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');
```

---

## Linter Usage

The project uses ESLint for code quality enforcement.

- **Frontend**: ESLint is configured via the `eslintConfig` field in `packages/frontend/package.json`, extending `react-app` and `react-app/jest`. Do not disable ESLint rules without a documented reason.
- **Backend**: Follow the same ESLint discipline even where a config file is not yet present — avoid patterns that would fail standard Node.js linting rules.
- Run ESLint before committing changes. Fix all errors; investigate and resolve warnings rather than suppressing them.
- Never use `// eslint-disable` comments as a shortcut to bypass legitimate issues.

---

## Naming Conventions

Clear, descriptive names reduce the need for comments and make code self-documenting.

- **Variables and functions**: Use `camelCase` (e.g., `fetchData`, `newItem`, `handleSubmit`).
- **React components**: Use `PascalCase` for component names and their files (e.g., `App.js`).
- **CSS classes**: Use `kebab-case` (e.g., `add-item-section`, `delete-btn`).
- **Constants**: Use `UPPER_SNAKE_CASE` only for true module-level constants that never change (e.g., `const PORT = process.env.PORT || 3030`).
- **Event handlers**: Prefix with `handle` (e.g., `handleSubmit`, `handleDelete`).
- **Boolean variables**: Use affirmative names that read naturally (e.g., `isLoading`, `hasError`).

---

## The DRY Principle

Do not Repeat Yourself. Duplicated logic creates inconsistency and makes maintenance harder.

- Extract repeated logic into shared utility functions or React hooks rather than copying and pasting code.
- If the same API call pattern, error handling block, or data transformation appears in more than one place, refactor it into a reusable function.
- Shared frontend utilities should live in `packages/frontend/src/utils/` and shared backend utilities in `packages/backend/src/utils/`.
- Avoid duplicating configuration values — define them once and reference them (e.g., use `process.env.PORT` with a single default rather than hardcoding port numbers in multiple files).

---

## Error Handling

- **Backend**: Wrap all route handlers in `try/catch` blocks and return appropriate HTTP status codes with a JSON error body. Log errors using `console.error` before responding.
- **Frontend**: Catch errors from all `fetch` calls and store them in component state for display. Always provide the user with a meaningful error message — never silently swallow errors.
- Validate inputs at the boundary: the backend validates request bodies before processing, and the frontend validates user input before submitting (e.g., trimming whitespace and checking for empty values).

---

## React Component Guidelines

- Prefer **functional components** with React hooks. Do not use class components for new code.
- Keep components focused — a component should do one thing well. If a component is growing complex, split it into smaller sub-components.
- Co-locate component-specific CSS or styles with the component file. Global styles belong in `index.css`; component styles belong in a file named after the component (e.g., `App.css`).
- Use **descriptive prop names** that make the component's API clear without needing documentation.

---

## General Best Practices

- **Small, focused functions**: Each function should have a single responsibility. If a function is doing too many things, break it apart.
- **Avoid magic numbers and strings**: Replace unexplained literals with named constants or configuration values.
- **Comments**: Write comments to explain *why*, not *what*. If the code requires a comment to explain what it does, consider renaming variables or restructuring the logic instead.
- **Consistency over preference**: When in doubt, follow the pattern already established in the surrounding code rather than introducing a new style.
- **Dependencies**: Do not add new third-party dependencies without considering the maintenance burden. Prefer the existing stack (Express, React, Jest, Playwright, Supertest, better-sqlite3) before reaching for additional libraries.

# Testing Strategy: Verdant-AI 🧪

Quality assurance is a P1 priority for Verdant-AI to ensure calculations are accurate, user data is secure, and the AI coaching loop functions flawlessly.

Our testing strategy covers the entire stack, enforced by Continuous Integration (CI).

## 1. Backend Testing (Pytest)

We use `pytest` to validate the core engine and authentication flows.
* **Calculation Engine:** Extensive unit tests verify the CO₂ emission factors against various input parameters (transport modes, food types, energy units). We ensure that the math mapping to regional benchmarks is 100% accurate.
* **Authentication & Security:** Tests cover bcrypt hashing validation, JWT token generation, expiration handling, and unauthorized route rejection.
* **API Route Handlers:** Integration tests mock the database and Gemini API to ensure router/service splits handle payload validation correctly.

## 2. Frontend Smoke & Component Tests

* **Smoke Tests:** Critical rendering paths (Onboarding -> Dashboard -> Logging an activity) are smoke-tested to ensure the app boots and navigates correctly without runtime crashes.
* **Unit Tests:** Utility functions (like date formatters and state selectors in Zustand) are tested for predictable output.
* **State Management:** Tests verify that the "GreenScore" and `EarthTwin` components update reactively when new logs are added to the store.

## 3. Continuous Integration (CI)

* **Automated Pipelines:** Our CI pipeline runs automatically on every Pull Request to the `main` branch.
* **Linting Checks:** PRs must pass ESLint (Frontend) and Ruff (Backend) checks.
* **Test Suite Execution:** The CI runner builds the lean Docker images and executes the full Pytest and frontend test suites. Deployments are blocked if any tests fail.

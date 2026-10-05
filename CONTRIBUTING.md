# Contributing

## Branching strategy

- `main` is protected: no direct pushes.
- Create a branch per task:
  - `feature/...` for new functionality
  - `fix/...` for bug fixes
  - `chore/...` for tooling, docs, CI

## Workflow

1. Open or pick an issue using the provided templates.
2. Create a branch from `main`.
3. Make your changes, write meaningful commit messages.
4. Run `npm test` before pushing.
5. Open a Pull Request using the PR template. Reference the issue (`Closes #X`).
6. Request a review from a teammate. Address feedback.
7. Once approved and CI passes, merge the PR.

## Commit messages

Write clear, descriptive commits.

Good:
- `Add task status validation`
- `Fix calculateTotal to multiply price by quantity`

Avoid:
- `update`
- `fix`
- `final`

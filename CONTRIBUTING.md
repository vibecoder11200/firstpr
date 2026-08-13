# Contributing to FirstPR

Hi, and thanks for considering contributing — that's the whole point of this project. FirstPR exists to help junior developers land their first open-source PR, and this repo dogfoods exactly that philosophy.

Two rules up front:

1. **You do not need to be an expert.** Beginner-friendly issues are labelled `good first issue`.
2. **Read this file first.** The whole point is that this repo does not have the very problem it exists to solve.

---

## Getting started

1. Find an issue you'd like to work on (start with any labelled `good first issue`).
2. Comment on the issue to say you're picking it up, so nobody else takes it.
3. Fork the repo, then clone your fork:

   ```sh
   git clone https://github.com/<your-name>/firstpr.git
   cd firstpr
   ```

4. Create a branch with a descriptive name:

   ```sh
   git checkout -b fix/descriptive-slug
   ```

5. Make your change. Keep it **small and focused** — one issue, one branch, one PR.

## Commit conventions

This repo enforces a **commit-style hook** that rejects PRs or commits containing
attribution trailers such as `Co-Authored-By`, `Signed-off-by`, `Reviewed-by`,
`Generated with`, etc. **Never add these lines to your commit message.**

Commit messages should follow **Conventional Commits**:

```
type(scope): short summary

optional longer body explaining what and why
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `style`.

Examples:

```sh
# good
git commit -m "docs: explain the quality score in README"

# bad — will be rejected by the hook
git commit -m "...\n\nCo-Authored-By: Name <email>"
```

If your editor or tooling auto-appends attribution trailers, configure it to stop —
otherwise the hook will block the commit.

## Submitting a PR

1. Push your branch and open a PR **against `main`**:

   ```sh
   git push -u origin fix/descriptive-slug
   ```

2. In the PR description, tell us:
   - which issue it closes (e.g. `Closes #12`)
   - what you changed and why
   - how it was tested

3. Keep PRs small. If you find yourself expanding scope, split it into multiple PRs.

4. A maintainer will review. Be patient — solo-maintainer projects can be slow to
   respond, and sometimes we need a bit to get back to you. Tagging or bumping
   repeatedly usually slows things down.

## Issue etiquette

- **Don't open a PR for an issue already claimed** by someone (check comments first).
- For bug reports: describe steps to reproduce, expected vs actual behaviour, and your environment.
- For feature ideas: describe the problem you're solving, not just the feature name.

## Code of conduct

Be kind. This project is for people making their first contribution, and they will
make mistakes — that is expected and welcome. No gatekeeping, no snark, no personal
attacks. Harassment of any kind will not be tolerated.

## What we're looking for

- Beginner-friendly onboarding (this is the product — help us dogfood it).
- Clear documentation.
- Small, well-scoped bug fixes and tests.
- Honest, kind reviews, even if you're new.

---

Questions? Open an issue and ask — asking is contributing.
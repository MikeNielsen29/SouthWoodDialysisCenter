# CLAUDE.md

This project follows `AGENTS.md` as the authoritative build & security spec.
Read `AGENTS.md` and `docs/BUILD_PLAN.md` before making any change.

Key rules (full text in `AGENTS.md`):
1. Find where the bug starts, not just where it shows up.
2. No patches that guess — identify the root cause first.
3. Newer commit ≠ correct; the spec (`docs/BUILD_PLAN.md`) wins.
4. Never weaken auth/security (bcrypt + jose per §7); no stubs.
5. The public design on `/`, `/about`, `/services`, `/news`, `/contact` is frozen.

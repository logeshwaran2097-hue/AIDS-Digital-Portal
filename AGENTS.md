# Antigravity IDE Engineering System & Autonomous Agents Protocol

This workspace is powered by 4 integrated autonomous engineering engines:

---

## ⚡ 1. GSD Core (Get Shit Done Engine)
- **Action Over Words:** Deliver running code, real database updates, and verified outputs over theoretical discussions.
- **Atomic Decompositions:** Break complex objectives into bite-sized milestones. Implement, verify, and commit atomically.
- **Relentless Ownership:** When encountering issues, diagnose and resolve them end-to-end without burdening the user with intermediate friction.

---

## 🎭 2. Roo Code Execution Modes
The agent operates under specialized task modes:
- **`code`:** High-speed implementation with atomic diffs and type verification.
- **`architect`:** High-level system design, schema modeling, and modular roadmaps without premature code edits.
- **`debug`:** Hypothesis-driven isolation of stack traces, race conditions, and root causes.
- **`test`:** Test-driven development, edge-case coverage, and regression prevention.
- **`ask`:** Advisory, documentation, and codebase navigation.

**Tool Discipline:** Always inspect line numbers and file contents prior to editing. Never make blind replacements.

---

## 🔁 3. The Ralph Autonomous Self-Correction Loop
Whenever an error, compile issue, or test failure occurs, enter the Ralph Loop:
1. **Observe:** Inspect the exact command stdout/stderr, stack trace, and diagnostic codes.
2. **Orient:** Analyze system constraints, schemas, and root causes. Never guess blindly.
3. **Decide:** Choose a single minimal, surgical intervention.
4. **Act:** Apply the precise code change.
5. **Verify:** Re-run the diagnostic command. If it passes, conclude. If it fails, capture the new error and loop autonomously without halting.

---

## 🐇 4. CodeRabbit AI Review Standards
Before any major feature or PR completion, apply CodeRabbit quality criteria:
- **Security:** Zero exposed secrets, verify authentication tokens, ensure strict Zod schema validation on inbound APIs.
- **Performance:** Check for N+1 queries, unindexed lookups, memory bloat, and re-render cycles.
- **Architecture:** Clean modularity, strict TypeScript typing without `any`, and adherence to repository conventions.
- **Verification:** Run builds (`npm run build` / `tsc`) and test suites to prove correctness.

---

## ☁️ 5. Infrastructure & Deployment: Vercel Only (No Render)
- **Platform:** Strictly **Vercel** (`https://aids-digital-portal-logeshwaran.vercel.app`).
- **Policy:** Never configure, deploy to, or query Render services. All production builds, serverless routes, cron jobs, and DNS run entirely on Vercel.
- **Database:** Supabase PostgreSQL with PgBouncer connection pooling.
- **Mobile APK:** Configured to target the live Vercel production domain.

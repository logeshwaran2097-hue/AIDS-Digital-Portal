---
name: gsd-core
description: >-
  Get Shit Done (GSD) Core execution engine for high-velocity autonomous software delivery.
  Use when the user wants relentless execution, rapid prototyping, direct problem-solving,
  atomic task completion, or requests "GSD" workflow to eliminate fluff and deliver working software.
---

# GSD Core (Get Shit Done) Engine

The GSD Core engine is a high-velocity, milestone-driven execution framework designed to maximize throughput, eliminate hesitation, and deliver production-grade software with relentless focus.

---

## ⚡ Core Philosophy: The 5 Laws of GSD

1. **Bias Towards Action:** Code that runs beats architecture that sits on a whiteboard. Start with the minimal working proof, then iterate rapidly.
2. **Never Claim Without Proving:** Never say "this should work" or "the fix is complete" without running the build, executing the test, or querying the endpoint.
3. **Atomic Execution:** Break massive objectives into small, self-contained, verifiable units. Finish one unit, verify it, commit it, and move immediately to the next.
4. **Relentless Problem Solving:** When hitting an error, do not ask the user for basic debugging assistance. Hypothesize, test, isolate the root cause, and solve it autonomously.
5. **Zero Fluff Communication:** Report results in crisp, actionable bullet points with file paths, commit hashes, and verification commands.

---

## 🔄 GSD Execution Protocol

```mermaid
graph TD
    A[Task Ingest] --> B[Atomic Decomposition]
    B --> C[Identify Bottleneck]
    C --> D[Surgical Implementation]
    D --> E[Real-Time Verification]
    E -->|Fails| C
    E -->|Passes| F[Atomic Commit & Deploy]
    F --> G[Deliver Next Milestone]
```

### 1. Ingest & Decompose
- Deconstruct the user request into concrete deliverables with verifiable acceptance criteria.
- Strip away unnecessary abstractions or premature optimizations.
- Identify the single hardest technical blocker first.

### 2. Surgical Execution
- Inspect existing files and patterns before writing new code.
- Make targeted, non-breaking edits using precise file manipulation.
- Preserve existing working code, types, and comments.

### 3. Immediate Verification
- Run compiler checks (`tsc`, `npm run build`, linting).
- Execute unit or integration tests (`npm test`, `npx tsx <script>`).
- If an API or database is involved, query the live instance to confirm data persistence.

### 4. Continuous Progression
- Commit verified changes with descriptive, conventional commit messages.
- Push to the branch or deployment pipeline without lingering.
- Immediately transition to the next pending item until the entire milestone is achieved.

---

## 🛠️ GSD Checklist for Every Turn
- [ ] Did I read the target file first?
- [ ] Is my change minimal, surgical, and robust?
- [ ] Did I verify the change with a real command/script?
- [ ] Are all types, exports, and imports intact?
- [ ] Did I commit and document the tangible outcome?

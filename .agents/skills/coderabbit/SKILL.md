---
name: coderabbit
description: >-
  CodeRabbit AI Code Review, Static Analysis, and Pull Request Quality Engine.
  Use when the user requests an automated code review, PR quality inspection, security audit,
  architectural review, performance optimization check, or mentions "CodeRabbit".
---

# CodeRabbit Quality & Code Review Engine

CodeRabbit provides an automated, AI-driven code review methodology for comprehensive security, architecture, performance, and maintainability checks.

---

## 🐇 The CodeRabbit Review Taxonomy

### 1. 🛡️ Security & Vulnerabilities (High Priority)
- **Authentication & Authorization:** Verify role checks, RLS policies, token validation, and session boundaries.
- **Injection Flaws:** SQL injection, command injection, XSS, unescaped user HTML rendering.
- **Secrets Management:** Ensure zero hardcoded API keys, database passwords, or JWT secrets in tracked files.
- **Input Validation:** Ensure all inbound API routes strictly validate request payloads with schemas (e.g. Zod).
- **Rate Limiting & Abuse Protection:** Verify endpoints exposed to public abuse have throttling mechanisms.

### 2. ⚡ Performance & Scalability
- **Database Efficiency:** Check for N+1 queries, unindexed foreign key lookups, and unpooled connections.
- **Client-Side Rendering:** Eliminate redundant re-renders, unmemoized expensive computations, and oversized bundle imports.
- **Resource Management:** Ensure file streams, background tasks, and database connections are closed/disconnected.

### 3. 🏗️ Architecture & Maintainability
- **Modularity:** Separation of concerns between UI views, server actions, API routes, and data access layers.
- **DRY Principle:** Refactor duplicated business logic into shared utilities or hooks.
- **Type Safety:** Eliminate `any` types, verify null/undefined guards, and enforce strict TypeScript signatures.

### 4. 🧪 Test Coverage & Reliability
- Verify critical workflows (auth, checkout, submission, data deletion) have automated test coverage.
- Check boundary conditions: null inputs, empty lists, special characters, network timeouts.

---

## 📋 CodeRabbit Review Output Format

When performing a CodeRabbit review, format findings using the standard CodeRabbit template:

```markdown
### 🐇 CodeRabbit Code Review Summary

#### 🌟 Key Improvements & Highlights
- [Positive assessment of well-crafted patterns in the changeset]

#### ⚠️ Critical / High Issues
- **[File:Line]**: [Description of vulnerability, memory leak, or broken invariant]
  - *Fix Recommendation*: [Concrete code diff or solution]

#### 💡 Suggestions & Optimization
- **[File:Line]**: [Code cleanliness, typing improvement, or micro-optimization]

#### 📊 Verification Status
- Build Status: [Passed / Failed]
- Security Checks: [Clean / Warnings]
- Performance Impact: [Neutral / Improved]
```

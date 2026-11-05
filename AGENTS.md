# AGENTS.md — Permanent AI Collaboration & Engineering Protocol

> **CRITICAL DIRECTIVE FOR ALL AI AGENTS**
>
> This repository is collaboratively maintained and developed by two autonomous AI agents:
> 1. **OpenAI Codex**
> 2. **Google Antigravity**
>
> **Neither agent owns the project.** Both operate under identical rules. You must read, respect, and strictly enforce the protocols in this document before performing any operation.

---

## 1. Golden Rules of Engineering

1. **Read Before Executing**: Always read `AGENTS.md`, `docs/PROJECT.md`, `docs/TASKS.md`, and the latest entry in `docs/HANDOFF_LOG.md` before starting any task.
2. **Inspect Actual Code**: Always inspect the filesystem and code state before editing. Never assume planned features are already built or that a previous agent's summary is bug-free.
3. **No Phantom Implementations**: Never mark tasks as complete in `TASKS.md` or claim in documentation that features exist when they are only partially implemented or planned.
4. **Never Break Working Code**: Do not rewrite or overwrite working components without a full understanding of their role, dependencies, and architecture.
5. **Strict Scope Discipline**: Touch only files relevant to your active assigned task. Do not reformat, refactor, or touch unrelated modules.
6. **No Unnecessary Dependencies**: Avoid introducing heavy libraries, extraneous microservices, or complex state stores unless explicitly justified and documented in `DECISIONS.md`.
7. **Absolute Prohibition of Diagnostic / ML Classifiers**:
   - **DO NOT** implement Parkinson's disease classification models.
   - **DO NOT** calculate disease probabilities or risk scores.
   - **DO NOT** label metrics with clinical disease diagnostic claims.
   - The platform calculates purely descriptive, explainable physical and signal metrics (frequency in Hz, tapping intervals, amplitude decrement).
8. **No Clinical Validation Claims**: Maintain the mandatory medical disclaimer on all generated UI views, documentation, and exported reports.
9. **Test Before Declaring Complete**: Always verify execution (syntax checks, unit tests, linting, or local runs) before closing a task.
10. **Synchronize Documentation**: Whenever you change architecture, APIs, decisions, or task states, update `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, and `docs/TASKS.md` immediately.
11. **Document Technical Choices**: Major changes to data structures, signal filtering thresholds, or architectural boundaries must be recorded in `docs/DECISIONS.md`.
12. **Record Meaningful AI Work in `PROMPT.md`**: Log all significant tasks, file diffs, test runs, and handoff instructions in `PROMPT.md`.
13. **Security & Secrets**: Never commit `.env` files, API keys, credentials, or private patient recordings.
14. **No History Fabrication**: Never fabricate test outputs, falsify benchmarks, create artificial git commit messages to disguise reused code, or lie about research sources.
15. **Transparent Research Attribution**: Record every reused mathematical formula, pipeline concept, or algorithm adapted from external sources (e.g., `parkscreen`, `UBU-PD-FT-Assessment`) in `docs/REUSE_AND_ATTRIBUTION.md`.
16. **Prefer Demonstrable Simplicity**: For a 24-hour hackathon, prioritize rock-solid, demonstrable, and visually clear implementations over convoluted abstractions.

---

## 2. Context-Switching Protocol (Codex ⇄ Antigravity)

Handoffs between OpenAI Codex and Google Antigravity must be frictionless. To guarantee uninterrupted continuity, follow this step-by-step handoff ritual.

```
┌─────────────────────────────────┐
│       OUTGOING AGENT            │
│ 1. Verify working code & tests  │
│ 2. Update TASKS.md & PROMPT.md  │
│ 3. Write HANDOFF_LOG.md entry   │
│ 4. Commit changes               │
└────────────────┬────────────────┘
                 │
                 ▼
       [ GitHub / Local Repo ]
                 │
                 ▼
┌─────────────────────────────────┐
│       INCOMING AGENT            │
│ 1. Read AGENTS.md & PROJECT.md  │
│ 2. Read latest HANDOFF_LOG.md   │
│ 3. Inspect git status & code    │
│ 4. Execute next documented task │
└─────────────────────────────────┘
```

### When Outgoing Agent (Codex or Antigravity) Finishes a Work Session:
1. **Verify State**: Ensure code runs without syntax or runtime errors. If something is left incomplete, document the exact failure state.
2. **Update Task Board**: In `docs/TASKS.md`, move finished tasks to `Completed`, update active items in `In Progress`, and note any blockers.
3. **Log AI Activity**: In `PROMPT.md`, record a task entry detailing objectives, modified files, tests conducted, and remaining work.
4. **Create Handoff Log Entry**: Append a new entry to `docs/HANDOFF_LOG.md` using the Standard Handoff Template below.
5. **Commit Cleanly**: Create a descriptive git commit (e.g., `feat(tremor): add FFT frequency calculation service`).

### When Incoming Agent (Antigravity or Codex) Resumes Development:
1. **Read Core Context**: Read `AGENTS.md`, `docs/PROJECT.md`, `docs/TASKS.md`, and the newest entry in `docs/HANDOFF_LOG.md`.
2. **Ground Truth Verification**: Run `git status` and inspect the actual changed files. **Do not blindly accept the outgoing agent's summary as proof of functional perfection.**
3. **Confirm Scope**: Pick up precisely from the `Next Recommended Action` specified in `docs/HANDOFF_LOG.md`.
4. **Maintain Protocol**: Ensure your subsequent edits adhere to the Golden Rules.

---

## 3. Standard Handoff Template

When concluding a session, copy and fill this markdown block into `docs/HANDOFF_LOG.md`:

```markdown
## Handoff Entry: [YYYY-MM-DD HH:MM UTC]
- **Outgoing Agent**: [Codex | Antigravity]
- **Incoming Agent**: [Antigravity | Codex | Any]
- **Current Development Phase**: [Foundation | Hand Tracking | Tremor Analysis | Tapping Analysis | Dashboard | Polish]
- **Work Completed in this Session**:
  - [Bullet point summary of delivered components]
- **Files Modified / Created**:
  - `path/to/file1`
  - `path/to/file2`
- **Verification Performed**:
  - [Exact commands executed and tests passed]
- **Current Operational State**:
  - [e.g., Backend running on 8000, hand tracking canvas renders, FFT endpoint responds]
- **Known Quirks / Blockers**:
  - [Any caveats, unhandled edge cases, or dropped frames]
- **Next Recommended Action for Incoming Agent**:
  - [Specific, prioritized task to execute next]
```

---

## 4. Git Collaboration Rules

- **Source of Truth**: The local and remote repository is the single source of truth.
- **Pull Before Starting**: Ensure working tree is clean and up to date before launching edits.
- **Atomic Commits**: Group related changes logically. Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
- **No Concurrent Overwrites**: When switching tasks, avoid parallel edits to the same files without branching.
- **Honesty in Version Control**: Never falsify commit author metadata or commit timestamps to deceive judges or collaborators.

---

## 5. Architectural Non-Negotiables for NeuroMotion AI

1. **Units & Coordinate Systems**:
   - Always differentiate between raw pixel coordinates ($x, y$ in video frame pixels) and normalized MediaPipe coordinates ($0.0 \le x, y \le 1.0$).
   - For finger tapping, normalize fingertip distance by a reference hand metric (such as wrist-to-middle-MCP distance) so variations in distance to the camera do not distort amplitude measurements.
2. **Signal Quality Guardrails**:
   - If camera FPS drops below 20 FPS or tracking confidence drops, flag the recording as `UNRELIABLE_SAMPLING`.
   - Never report tremor FFT frequencies if the recording duration is less than 3 seconds or if the Nyquist rate is violated.
3. **Visual Polish**:
   - Follow `docs/DESIGN_SYSTEM.md`. Maintain clean dark-mode visuals with high-contrast data readouts suitable for clinical and hackathon presentation.


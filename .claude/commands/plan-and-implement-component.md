---
argument-hint: <component-name>
description: Plan and implement a frontend reusable component using specialized agents
---

Orchestrate planning and implementing a frontend reusable component in two phases.

Component: $1

## Phase 1: Planning

Use the `architect` skill, then run `/component-plan $1`

After planning completes, display the plan file path and **WAIT for user confirmation** before proceeding.

## Phase 2: Implementation

**ONLY after user confirmation:**

Read the implementation plan file (captures any user edits), then use the `implement-react` skill followed by `/component-implementation @[PLAN_FILE_PATH]`

## Notes

- Run phases sequentially
- Pause after Phase 1 for user review
- Read plan file before Phase 2
- Report errors immediately

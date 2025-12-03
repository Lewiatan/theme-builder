---
description: "Plan and implement a frontend view using specialized agents (project)"
argument-hint: "<view-description> <user-stories> <endpoint-description> <endpoint-implementation>"
---

Orchestrate planning and implementing a frontend view in two phases.

**Required Parameters:**
- $1: View Description
- $2: User Stories
- $3: Endpoint Description
- $4: Endpoint Implementation

## Parameter Validation

Use `parameter-validation` skill to validate all 4 parameters. **STOP if any are missing** and wait for user input.

## Phase 1: Planning

Run `/view-plan` with the 4 validated parameters

After planning completes, display the plan file path and **WAIT for user confirmation** before proceeding.

## Phase 2: Implementation

**ONLY after user confirmation:**

Read the implementation plan file (captures any user edits), and read `@[PLAN_FILE_PATH]`

## Notes

- Validate parameters before Phase 1
- Run phases sequentially
- Pause after Phase 1 for user review
- Read plan file before Phase 2
- Report errors immediately

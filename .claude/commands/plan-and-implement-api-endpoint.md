---
argument-hint: <models-files> <tech-stack> <route-specification>
description: Plan and implement a REST API endpoint using specialized agents
---

Orchestrate planning and implementing a REST API endpoint in three phases.

**Required Parameters:**
- $1: Database Models/Entities
- $2: Tech Stack
- $3: Route Specification

## Parameter Validation

Use `parameter-validation` skill to validate all 3 parameters. **STOP if any are missing** and wait for user input.

## Phase 1: Planning

Use the `architect` skill, then run `/plan-api-endpoint` with the 3 validated parameters

After planning completes, display the plan file path and **WAIT for user confirmation** before proceeding.

## Phase 2: Request DTO Check

Read the implementation plan to identify the expected Request DTO class name and location.

Check if the Request DTO exists. If NOT, use the `implement-symfony` skill then run `/generate-requests @($1) @[PLAN_FILE_PATH]`

If it exists, skip to Phase 3.

## Phase 3: Implementation

**After confirming Request DTO exists:**

Read the implementation plan file (captures any user edits), then use the `implement-symfony` skill followed by `/implement-api-endpoint @[PLAN_FILE_PATH]`

## Notes

- Validate parameters before Phase 1
- Run phases sequentially
- Pause after Phase 1 for user review
- Check Request DTO before Phase 3
- Generate Request DTO only if missing
- Read plan file before Phase 3
- Report errors immediately

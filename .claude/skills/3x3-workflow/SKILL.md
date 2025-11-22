---
name: 3x3 workflow
description: Break large implementations into manageable 3-step chunks with user checkpoints.
---

# 3x3 Workflow Skill

## Workflow

1. **Read the implementation plan** - Count total steps
2. **Implement ONLY the first 3 steps** (or fewer if less than 3 remain)
3. **IMMEDIATELY STOP after 3 steps** - Do not continue
4. **Present checkpoint summary** using this template:

   ```
   ## 3x3 Workflow Checkpoint

   ### ✅ Completed (Steps X-Y of Z total):
   - Step X: [description]
   - Step Y: [description]
   - Step Z: [description]

   ### 📋 Remaining Steps:
   - Step A: [description]
   - Step B: [description]
   - Step C: [description]

   ### 🎯 Proposed Next 3 Steps:
   1. [Step A]
   2. [Step B]
   3. [Step C]

   **Ready to proceed? Please confirm to continue with the next 3 steps.**
   ```

5. **WAIT for explicit user approval** - Do NOT continue without confirmation

## Critical Rules
- ⛔ **NEVER implement more than 3 steps without stopping**
- ⛔ **NEVER continue without user confirmation**
- ✅ **ALWAYS present the checkpoint summary**
- ✅ **ALWAYS ask for permission to proceed**

---
name: parameter-validation
description: Validate required command parameters before execution
---

# Parameter Validation

This skill validates that all required parameters for a command are provided before execution begins.

## Purpose

When executing complex commands that require multiple input parameters, validate all parameters upfront to prevent starting execution with incomplete information.

## Usage

The command should invoke this skill by specifying the required parameters with their:
- Parameter number ($1, $2, etc.)
- Parameter value
- User-facing label (e.g., `<view-description>`, `<endpoint-implementation>`)
- Description of what the parameter should contain

## Validation Process

**Step 1: Check all parameters**

For each specified parameter:
1. Check if the parameter value is present
2. Check if the parameter value is non-empty (not just whitespace)
3. Record which parameters are missing or empty

**Step 2: Handle missing parameters**

**If ANY parameter is missing or empty:**

1. **STOP EXECUTION immediately** - Do not proceed with the command
2. Display which parameters are missing using their user-facing labels
3. Format the output clearly:

```
Missing required parameters:
- ❌ <parameter-label-1>
- ❌ <parameter-label-2>

Please provide the missing information to proceed.
```

4. **Request each missing parameter directly** with clear descriptions:
   - Explain what information is needed for each parameter
   - Provide context about why this information is required
   - Do NOT use the AskUserQuestion tool or provide multiple choice options

5. **Wait for user response** - Do not proceed until all parameters are provided

**Step 3: Re-validate after user response**

1. After the user provides missing information, re-validate all parameters
2. If still incomplete, repeat Step 2
3. If all parameters are now present, confirm validation is complete:

```
✅ All required parameters validated. Proceeding with the command.
```

**If all parameters are present from the start:**

1. Confirm that validation is complete
2. Allow the command to proceed immediately

## Important Guidelines

- **Use parameter labels**: Always refer to parameters by their user-facing labels (e.g., `<view-description>`, not "view description")
- **No predefined options**: Do NOT use the AskUserQuestion tool with predefined options
- **Direct text input**: Simply ask for text input in your response to the user
- **Batch missing parameters**: If multiple parameters are missing, list them all at once and wait for the user to provide them
- **No assumptions**: Never proceed with empty or placeholder parameters - always wait for user input
- **Clear communication**: Be explicit about what information is needed and why
- **Reference by label**: When asking for parameters, use the exact label format from the command (e.g., `<parameter-label>`)

## Example Flow

**Scenario: 2 out of 4 parameters are missing**

```
Missing required parameters:
- ❌ <user-stories>
- ❌ <endpoint-implementation>

Please provide the missing information to proceed.

For <user-stories>: Include the relevant user stories with acceptance criteria. This helps define the feature requirements and expected behavior.

For <endpoint-implementation>: Detail the backend implementation including controllers, services, and response format. This provides the technical context needed for planning.
```

**After user provides the information:**

```
✅ All required parameters validated. Proceeding with the command.
```

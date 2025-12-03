---
description: "Implement a view following a 3x3 workflow from an implementation plan (project)"
argument-hint: "<implementation-plan-file-or-content>"
---

# View Implementation

Orchestrate planning and implementing a REST API endpoint in two phases.

**Required Parameters:**
- $1: Implementation Plan

Use the `implement-react` skill.

## Phase 1: Parameter Validation

Use `parameter-validation` skill to validate all 3 parameters. **STOP if any are missing** and wait for user input.

## Phase 2: Implementation 

First, review the implementation plan:

<implementation_plan>
$1
</implementation_plan>

Implement the plan according to the following approach:

<implementation_approach>
Use `3x3-wokflow` skill
</implementation_approach>

Carefully analyze the implementation plan and rules. Pay special attention to component structure, API integration requirements, and user interactions described in the plan.

Execute the following steps to implement the frontend view:

1. Component Structure:
   - Identify all components listed in the implementation plan.
   - Create a hierarchical structure of these components.
   - Ensure that each component's responsibilities and relationships are clearly defined.

2. API Integration:
   - Identify all API endpoints listed in the plan.
   - Implement necessary API calls for each endpoint.
   - Handle API responses and update component state accordingly.

3. User Interactions:
   - List all user interactions specified in the implementation plan.
   - Implement event handlers for each interaction.
   - Ensure that each interaction triggers the appropriate action or state change.

4. State Management:
   - Identify required state for each component.
   - Implement state management using the appropriate method (local state, custom hook, shared state).
   - Ensure that state changes trigger necessary re-renders.

5. Styling and Layout:
   - Apply specified styling and layout as mentioned in the implementation plan.
   - Ensure responsiveness if required by the plan.

6. Error Handling and Edge Cases:
   - Implement error handling for API calls and user interactions.
   - Consider and handle potential edge cases listed in the plan.

7. Performance Optimization:
   - Implement any performance optimizations specified in the plan or rules.
   - Ensure efficient rendering and minimal unnecessary re-renders.

8. Testing:
   - If specified in the plan, implement unit tests for components and functions.
   - Thoroughly test all user interactions and API integrations.

Throughout the implementation process, strictly adhere to the provided implementation rules. These rules take precedence over any general best practices that may conflict with them.

Ensure that your implementation accurately reflects the provided implementation plan and adheres to all specified rules. Pay special attention to component structure, API integration, and handling of user interactions.

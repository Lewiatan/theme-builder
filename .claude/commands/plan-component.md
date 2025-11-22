---
argument-hint: <component-name>
description: Create a detailed implementation plan for a frontend reusable component (project)
---

You are an experienced software architect whose task is to create a detailed implementation plan for a frontend reusable component. Your plan will guide the development team in effectively and correctly implementing this component.

Before we begin, review the following information:

1. Component being implemented:
<component_name>
$1
</component_name>

2. Components implementation plan:
<components_implementation_plan>
@.ai/components-plan.md
</components_implementation_plan>

3. Product Requirements:
<prd>
@.ai/prd.md
</prd>

4. Database Schema:
<database_schema>
@.ai/db-plan.md
</database_schema>

5. Tech stack:
<tech_stack>
@.ai/tech-stack.md
</tech_stack>

Your task is to create a comprehensive implementation plan for the component. Before delivering the final plan, use <analysis> tags to analyze the information and outline your approach. In this analysis, ensure that:

1. Summarize key points of the component implementation.
2. List necessary data for component rendering that will be stored in the database.
3. List necessary interfaces and types.
4. Consider how to extract common interface/abstract component for reusability (existing or new, if it doesn't exist).
5. Plan input validation according to the API endpoint specification, database resources, and implementation rules.
6. The validation should be performed with Zod.
7. Identify potential problems based on the PRD and tech stack.
8. Outline potential error scenarios.

After conducting the analysis, create a detailed implementation plan in markdown format. The plan should contain the following sections:

1. Component Overview
2. Necessary Data
3. Rendering Details
4. Data Flow
5. Security Considerations
6. Error Handling
7. Performance Considerations
8. Implementation Steps

Throughout the plan, ensure that you:
- Adapt to the provided tech stack
- Follow the provided implementation rules
- Follow the Components Plan
- The variants in implementation plan are exactly the same as the ones mentioned in the components plan.

The final output should be a well-organized implementation plan in markdown format focused on implementation guidance. DO NOT include:
- Code examples or snippets
- Testing sections or test cases
- Documentation sections

Here's an example of what the output should look like:

```markdown
# Component Implementation Plan: [Component Name]

## 1. Component Overview
[Brief description of component purpose and functionality]

## 2. Necessary Data
  - Title: string
  - Subtitle: string
  - CTA Text: string, optional
  - CTA Link: string, optional
  - Background Image URL: string, optional

## 3. Rendering Details
[All the rendering details necessary for implementation]

## 4. Data Flow
[Description of data flow, including interactions with external services or databases]

## 5. Security Considerations
[Authentication, authorization, and data validation details]

## 6. Error Handling
[List of potential errors and how to handle them]

## 7. Performance Considerations
[Potential bottlenecks and optimization strategies]

## 8. Implementation Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]
...
```

The final output should consist solely of the implementation plan in markdown format and should not duplicate or repeat any work done in the analysis section. Focus on clear implementation guidance without code examples.

Remember to save your implementation plan as .ai/components/{component-name}-component-implementation-plan.md. Ensure the plan is detailed, clear, and provides comprehensive guidance for the development team.

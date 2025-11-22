You are a GitHub Actions specialist in the stack TECH_STACK

Based on the provided DESCRIPTION prepare the github action.

Create a "pull-request.yml" scenario using `github-action` skill.

Workflow:
The "pull-request.yml" scenario should work as follows:

- Linting code
- Then unit-test
- Finally - status-comment (comment to PR about the status of the whole)

Additional notes:
- status-comment runs only when the previous set of 3 passes correctly
- in the e2e job download browsers according to @playwright.config.ts
- in the e2e job set the "integration" environment and variables from secrets according to @.env.example
- collect coverage of unit tests and e2e tests

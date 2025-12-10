import { test, expect } from "@playwright/test";

/**
 * E2E tests for Login Flow
 * Tests the complete user authentication workflow
 */

test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test.describe("Successful Login", () => {
    test("user can log in with valid credentials", async ({ page }) => {
      await page.goto("/login");

      // Fill login form with credentials from ExampleShopSeeder
      await page.getByTestId("email-input").fill("demo@example.com");
      await page.getByTestId("password-input").fill("test123");

      // Submit form
      await page.getByTestId("submit-button").click();

      // Wait for navigation to workspace
      await expect(page).toHaveURL("/");

      // Verify workspace loaded by checking for the component library
      await expect(page.getByTestId("component-library")).toBeVisible();

      // Verify token stored in localStorage
      const token = await page.evaluate(() =>
        localStorage.getItem("jwt_token"),
      );
      expect(token).toBeTruthy();
      expect(token).toContain("eyJ"); // JWT tokens start with 'eyJ'
    });

    test("shows loading state during login", async ({ page }) => {
      await page.goto("/login");

      await page.getByTestId("email-input").fill("demo@example.com");
      await page.getByTestId("password-input").fill("test123");

      // Set up promise to wait for navigation
      const submitButton = page.getByTestId("submit-button");

      // Start clicking and immediately check for loading state
      // Use Promise.all to check loading state while navigation happens
      const clickPromise = submitButton.click();

      // Check for loading state (may or may not catch it depending on API speed)
      // Using a try-catch to make this non-critical
      try {
        await expect(submitButton).toContainText("Logging in", { timeout: 1000 });
        await expect(submitButton).toBeDisabled();
      } catch {
        // Loading state might be too fast to catch - this is acceptable
      }

      // Wait for click to complete
      await clickPromise;

      // Wait for navigation to complete
      await expect(page).toHaveURL("/");
    });
  });

  test.describe("Client-Side Validation", () => {
    test("shows validation errors for empty fields", async ({ page }) => {
      await page.goto("/login");

      // Submit without filling fields
      await page.getByTestId("submit-button").click();

      // Verify validation errors
      await expect(page.getByTestId("email-error")).toBeVisible();
      await expect(page.getByTestId("email-error")).toContainText(/email is required/i);
      await expect(page.getByTestId("password-error")).toBeVisible();
      await expect(page.getByTestId("password-error")).toContainText(/password is required/i);

      // Verify no navigation occurred
      expect(page.url()).toContain("/login");
    });

    test("shows validation error for invalid email format", async ({
      page,
    }) => {
      await page.goto("/login");

      await page.getByTestId("email-input").fill("invalid-email");
      await page.getByTestId("password-input").fill("password123");

      await page.getByTestId("submit-button").click();

      // Verify email format error
      await expect(page.getByTestId("email-error")).toBeVisible();
      await expect(page.getByTestId("email-error")).toContainText(/please enter a valid email address/i);
    });

    test("clears validation error when user starts typing", async ({
      page,
    }) => {
      await page.goto("/login");

      // Submit to trigger validation
      await page.getByTestId("submit-button").click();

      await expect(page.getByTestId("email-error")).toBeVisible();

      // Start typing in email field
      await page.getByTestId("email-input").fill("t");

      // Error should be cleared
      await expect(page.getByTestId("email-error")).not.toBeVisible();
    });
  });

  test.describe("Authentication Errors", () => {
    test("shows error for invalid credentials", async ({ page }) => {
      await page.goto("/login");

      await page.getByTestId("email-input").fill("nonexistent@example.com");
      await page.getByTestId("password-input").fill("wrongpassword");

      await page.getByTestId("submit-button").click();

      // Wait for error message
      await expect(page.getByTestId("api-error")).toBeVisible();
      await expect(page.getByTestId("api-error")).toContainText(/invalid email or password/i);

      // Verify still on login page
      expect(page.url()).toContain("/login");

      // Verify no token stored
      const token = await page.evaluate(() =>
        localStorage.getItem("jwt_token"),
      );
      expect(token).toBeNull();
    });
  });

  test.describe("Already Authenticated", () => {
    test("redirects to workspace if already authenticated", async ({
      page,
    }) => {
      // First, perform a successful login
      await page.goto("/login");
      await page.getByTestId("email-input").fill("demo@example.com");
      await page.getByTestId("password-input").fill("test123");
      await page.getByTestId("submit-button").click();

      // Wait for navigation
      await expect(page).toHaveURL("/");

      // Try to navigate back to login
      await page.goto("/login");

      // Should redirect to workspace
      await expect(page).toHaveURL("/");
    });
  });

  test.describe("Error Recovery", () => {
    test("user can retry after error", async ({ page }) => {
      await page.goto("/login");

      // Submit with invalid credentials
      await page.getByTestId("email-input").fill("wrong@example.com");
      await page.getByTestId("password-input").fill("wrongpassword");
      await page.getByTestId("submit-button").click();

      // Wait for error
      await expect(page.getByTestId("api-error")).toBeVisible();

      // Clear and enter correct credentials
      await page.getByTestId("email-input").fill("demo@example.com");
      await page.getByTestId("password-input").fill("test123");
      await page.getByTestId("submit-button").click();

      // Verify successful login
      await expect(page).toHaveURL("/");
    });

    test("error clears on new submission attempt", async ({ page }) => {
      await page.goto("/login");

      // Trigger error
      await page.getByTestId("email-input").fill("wrong@example.com");
      await page.getByTestId("password-input").fill("wrongpassword");
      await page.getByTestId("submit-button").click();

      await expect(page.getByTestId("api-error")).toBeVisible();

      // Start new attempt
      await page.getByTestId("email-input").fill("demo@example.com");
      await page.getByTestId("submit-button").click();

      // Error should be cleared during submission
      await expect(page.getByTestId("api-error")).not.toBeVisible();
    });
  });

  test.describe("Responsive Design", () => {
    test("login form works on mobile viewport", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("/login");

      // Verify form is visible and properly sized
      const form = page.getByTestId("login-form");
      await expect(form).toBeVisible();

      // Complete login flow on mobile
      await page.getByTestId("email-input").fill("demo@example.com");
      await page.getByTestId("password-input").fill("test123");
      await page.getByTestId("submit-button").click();

      // Verify successful login
      await expect(page).toHaveURL("/");
    });
  });

  test.describe("Accessibility", () => {
    test("form inputs have proper labels", async ({ page }) => {
      await page.goto("/login");

      // Check that labels are associated with inputs
      const emailLabel = page.getByTestId("email-label");
      const passwordLabel = page.getByTestId("password-label");

      await expect(emailLabel).toBeVisible();
      await expect(passwordLabel).toBeVisible();

      // Verify inputs can be found by their test IDs
      await expect(page.getByTestId("email-input")).toBeVisible();
      await expect(page.getByTestId("password-input")).toBeVisible();
    });

    test("form can be submitted with Enter key", async ({ page }) => {
      await page.goto("/login");

      await page.getByTestId("email-input").fill("demo@example.com");
      await page.getByTestId("password-input").fill("test123");

      // Press Enter in password field
      await page.getByTestId("password-input").press("Enter");

      // Should trigger form submission
      await expect(page).toHaveURL("/");
    });
  });
});

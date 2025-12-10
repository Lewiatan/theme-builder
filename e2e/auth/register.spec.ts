import { test, expect } from "@playwright/test";

/**
 * E2E tests for Registration Flow
 * Tests the complete user registration workflow
 */

test.describe("Registration Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test.describe("Successful Registration", () => {
    test("user can register with valid credentials", async ({ page }) => {
      await page.goto("/register");

      // Generate unique email for this test run
      const timestamp = Date.now();
      const email = `testuser${timestamp}@example.com`;
      const shopName = `Test Shop ${timestamp}`;

      // Fill registration form
      await page.getByTestId("email-input").fill(email);
      await page.getByTestId("password-input").fill("password123");
      await page.getByTestId("shop-name-input").fill(shopName);

      // Submit form
      await page.getByTestId("submit-button").click();

      // Wait for toast notification
      await expect(
        page.locator(
          "text=/account created successfully! redirecting to login/i",
        ),
      ).toBeVisible({ timeout: 2000 });

      // Verify navigation to login page
      await expect(page).toHaveURL("/login", { timeout: 3000 });
    });

    test("shows loading state during registration", async ({ page }) => {
      await page.goto("/register");

      const timestamp = Date.now();
      const email = `testuser${timestamp}@example.com`;
      const shopName = `Test Shop ${timestamp}`;

      await page.getByTestId("email-input").fill(email);
      await page.getByTestId("password-input").fill("password123");
      await page.getByTestId("shop-name-input").fill(shopName);

      // Click submit
      const submitButton = page.getByTestId("submit-button");
      await submitButton.click();

      // Check for loading state (button text has ellipsis)
      await expect(submitButton).toContainText("Creating Account");
      await expect(submitButton).toBeDisabled();

      // Wait for completion
      await expect(page).toHaveURL("/login", { timeout: 3000 });
    });
  });

  test.describe("Client-Side Validation", () => {
    test("shows validation errors for empty fields", async ({ page }) => {
      await page.goto("/register");

      // Submit without filling fields
      await page.getByTestId("submit-button").click();

      // Verify validation errors
      await expect(page.getByTestId("email-error")).toBeVisible();
      await expect(page.getByTestId("email-error")).toContainText(/email is required/i);
      await expect(page.getByTestId("password-error")).toBeVisible();
      await expect(page.getByTestId("password-error")).toContainText(/password is required/i);
      await expect(page.getByTestId("shop-name-error")).toBeVisible();
      await expect(page.getByTestId("shop-name-error")).toContainText(/shop name is required/i);

      // Verify no navigation occurred
      expect(page.url()).toContain("/register");
    });

    test("shows validation error for invalid email format", async ({
      page,
    }) => {
      await page.goto("/register");

      await page.getByTestId("email-input").fill("invalid-email");
      await page.getByTestId("password-input").fill("password123");
      await page.getByTestId("shop-name-input").fill("Test Shop");

      await page.getByTestId("submit-button").click();

      // Verify email format error
      await expect(page.getByTestId("email-error")).toBeVisible();
      await expect(page.getByTestId("email-error")).toContainText(/please enter a valid email address/i);
    });

    test("shows validation error for shop name too short", async ({
      page,
    }) => {
      await page.goto("/register");

      const timestamp = Date.now();
      const email = `testuser${timestamp}@example.com`;

      await page.getByTestId("email-input").fill(email);
      await page.getByTestId("password-input").fill("password123");
      await page.getByTestId("shop-name-input").fill("ab"); // Only 2 characters

      await page.getByTestId("submit-button").click();

      // Verify shop name length error
      await expect(page.getByTestId("shop-name-error")).toBeVisible();
      await expect(page.getByTestId("shop-name-error")).toContainText(/shop name must be at least 3 characters/i);
    });

    test("shows validation error for shop name too long", async ({ page }) => {
      await page.goto("/register");

      const timestamp = Date.now();
      const email = `testuser${timestamp}@example.com`;

      await page.getByTestId("email-input").fill(email);
      await page.getByTestId("password-input").fill("password123");
      await page.getByTestId("shop-name-input").fill("a".repeat(51)); // 51 characters

      await page.getByTestId("submit-button").click();

      // Verify shop name length error
      await expect(page.getByTestId("shop-name-error")).toBeVisible();
      await expect(page.getByTestId("shop-name-error")).toContainText(/shop name must be at most 50 characters/i);
    });

    test("shows validation error for invalid shop name characters", async ({
      page,
    }) => {
      await page.goto("/register");

      const timestamp = Date.now();
      const email = `testuser${timestamp}@example.com`;

      await page.getByTestId("email-input").fill(email);
      await page.getByTestId("password-input").fill("password123");
      await page.getByTestId("shop-name-input").fill("Test@Shop!"); // Invalid characters

      await page.getByTestId("submit-button").click();

      // Verify character validation error
      await expect(page.getByTestId("shop-name-error")).toBeVisible();
      await expect(page.getByTestId("shop-name-error")).toContainText(
        /shop name can only contain letters, numbers, spaces, hyphens, and underscores/i
      );
    });

    test("clears validation error when user starts typing", async ({
      page,
    }) => {
      await page.goto("/register");

      // Submit to trigger validation
      await page.getByTestId("submit-button").click();

      await expect(page.getByTestId("email-error")).toBeVisible();

      // Start typing in email field
      await page.getByTestId("email-input").fill("t");

      // Error should be cleared
      await expect(page.getByTestId("email-error")).not.toBeVisible();
    });
  });

  test.describe("Registration Errors", () => {
    test("shows error for email already exists", async ({ page }) => {
      await page.goto("/register");

      // Use email from ExampleShopSeeder
      await page.getByTestId("email-input").fill("demo@example.com");
      await page.getByTestId("password-input").fill("password123");
      await page.getByTestId("shop-name-input").fill("New Shop Name");

      await page.getByTestId("submit-button").click();

      // Wait for error message
      await expect(page.getByTestId("api-error")).toBeVisible({ timeout: 3000 });
      await expect(page.getByTestId("api-error")).toContainText(/an account with this email already exists/i);

      // Verify still on register page
      expect(page.url()).toContain("/register");
    });
  });

  test.describe("Already Authenticated", () => {
    test("redirects to workspace if already authenticated", async ({
      page,
    }) => {
      // Manually set token to simulate authenticated state
      await page.goto("/");
      await page.evaluate(() => {
        localStorage.setItem("jwt_token", "mock-jwt-token-for-test");
      });

      // Try to navigate to register
      await page.goto("/register");

      // Should redirect to workspace
      await expect(page).toHaveURL("/", { timeout: 3000 });
    });
  });

  test.describe("Error Recovery", () => {
    test("user can retry after error", async ({ page }) => {
      await page.goto("/register");

      // Submit with existing email
      await page.getByTestId("email-input").fill("demo@example.com");
      await page.getByTestId("password-input").fill("password123");
      await page.getByTestId("shop-name-input").fill("New Shop");
      await page.getByTestId("submit-button").click();

      // Wait for error
      await expect(page.getByTestId("api-error")).toBeVisible();

      // Clear and enter new credentials
      const timestamp = Date.now();
      const email = `testuser${timestamp}@example.com`;
      const shopName = `Test Shop ${timestamp}`;

      await page.getByTestId("email-input").fill(email);
      await page.getByTestId("password-input").fill("password123");
      await page.getByTestId("shop-name-input").fill(shopName);
      await page.getByTestId("submit-button").click();

      // Verify successful registration
      await expect(page).toHaveURL("/login", { timeout: 3000 });
    });

    test("error clears on new submission attempt", async ({ page }) => {
      await page.goto("/register");

      // Trigger error
      await page.getByTestId("email-input").fill("demo@example.com");
      await page.getByTestId("password-input").fill("password123");
      await page.getByTestId("shop-name-input").fill("New Shop");
      await page.getByTestId("submit-button").click();

      await expect(page.getByTestId("api-error")).toBeVisible();

      // Start new attempt
      const timestamp = Date.now();
      await page.getByTestId("email-input").fill(`testuser${timestamp}@example.com`);
      await page.getByTestId("submit-button").click();

      // Error should be cleared during submission
      await expect(page.getByTestId("api-error")).not.toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("provides link to login page", async ({ page }) => {
      await page.goto("/register");

      // Find login link
      const loginLink = page.getByTestId("login-link");
      await expect(loginLink).toBeVisible();

      // Click link and verify navigation
      await loginLink.click();
      await expect(page).toHaveURL("/login");
    });
  });

  test.describe("Responsive Design", () => {
    test("registration form works on mobile viewport", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("/register");

      // Verify form is visible and properly sized
      const form = page.getByTestId("register-form");
      await expect(form).toBeVisible();

      // Complete registration flow on mobile
      const timestamp = Date.now();
      const email = `testuser${timestamp}@example.com`;
      const shopName = `Test Shop ${timestamp}`;

      await page.getByTestId("email-input").fill(email);
      await page.getByTestId("password-input").fill("password123");
      await page.getByTestId("shop-name-input").fill(shopName);
      await page.getByTestId("submit-button").click();

      // Verify successful registration
      await expect(page).toHaveURL("/login", { timeout: 3000 });
    });
  });

  test.describe("Accessibility", () => {
    test("form inputs have proper labels", async ({ page }) => {
      await page.goto("/register");

      // Check that labels are associated with inputs
      const emailLabel = page.getByTestId("email-label");
      const passwordLabel = page.getByTestId("password-label");
      const shopNameLabel = page.getByTestId("shop-name-label");

      await expect(emailLabel).toBeVisible();
      await expect(passwordLabel).toBeVisible();
      await expect(shopNameLabel).toBeVisible();

      // Verify inputs can be found by their test IDs
      await expect(page.getByTestId("email-input")).toBeVisible();
      await expect(page.getByTestId("password-input")).toBeVisible();
      await expect(page.getByTestId("shop-name-input")).toBeVisible();
    });

    test("form can be submitted with Enter key", async ({ page }) => {
      await page.goto("/register");

      const timestamp = Date.now();
      const email = `testuser${timestamp}@example.com`;
      const shopName = `Test Shop ${timestamp}`;

      await page.getByTestId("email-input").fill(email);
      await page.getByTestId("password-input").fill("password123");
      await page.getByTestId("shop-name-input").fill(shopName);

      // Press Enter in shop name field (last field)
      await page.getByTestId("shop-name-input").press("Enter");

      // Should trigger form submission
      await expect(page).toHaveURL("/login", { timeout: 3000 });
    });
  });

  test.describe("Integration with Login", () => {
    test("user can register and then login with new account", async ({
      page,
    }) => {
      // Step 1: Register
      await page.goto("/register");

      const timestamp = Date.now();
      const email = `testuser${timestamp}@example.com`;
      const shopName = `Test Shop ${timestamp}`;
      const password = "password123";

      await page.getByTestId("email-input").fill(email);
      await page.getByTestId("password-input").fill(password);
      await page.getByTestId("shop-name-input").fill(shopName);
      await page.getByTestId("submit-button").click();

      // Wait for redirect to login
      await expect(page).toHaveURL("/login", { timeout: 3000 });

      // Step 2: Login with new account
      await page.getByTestId("email-input").fill(email);
      await page.getByTestId("password-input").fill(password);
      await page.getByTestId("submit-button").click();

      // Verify successful login
      await expect(page).toHaveURL("/");

      // Verify token stored in localStorage
      const token = await page.evaluate(() =>
        localStorage.getItem("jwt_token"),
      );
      expect(token).toBeTruthy();
      expect(token).toContain("eyJ"); // JWT tokens start with 'eyJ'
    });
  });
});

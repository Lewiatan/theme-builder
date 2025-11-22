import { test, expect, type Page } from '@playwright/test';
import { createTestJWT, getTestShopId } from './helpers/auth';

/**
 * E2E tests for Demo Shop navigation from Theme Builder
 * Based on test plan section 4.1: "Open Demo From Builder"
 */

test.describe('Demo Shop Navigation', () => {
  let testJWT: string;
  let shopId: string;

  test.beforeEach(async () => {
    // Get real JWT token from backend and shop ID for authenticated tests
    testJWT = await createTestJWT();
    shopId = getTestShopId();
  });

  /**
   * Helper function to perform login
   */
  async function loginToWorkspace(page: Page) {
    // Navigate to login page
    await page.goto('/login');

    // Wait for login form to be visible
    await expect(page.getByTestId('login-header')).toBeVisible();

    // Fill in JWT token in the textarea
    const tokenTextarea = page.getByTestId('token-input');
    await tokenTextarea.fill(testJWT);

    // Submit the login form
    const loginButton = page.getByTestId('login-button');
    await loginButton.click();

    // Wait for navigation to workspace
    await page.waitForURL('/');

    // Wait for workspace to load
    await expect(page.locator('header')).toBeVisible();
  }

  test('should open demo shop in new tab from Theme Builder', async ({ page, context }) => {
    // Login to workspace
    await loginToWorkspace(page);

    // Verify we're in the workspace (page selector is visible)
    const pageSelector = page.getByTestId('page-selector');
    await expect(pageSelector).toBeVisible();

    // Click the Demo button in the TopNavigationBar
    const demoButton = page.getByTestId('demo-button');
    await expect(demoButton).toBeVisible();

    // Set up listener for new page before clicking
    const newPagePromise = context.waitForEvent('page');

    await demoButton.click();

    // Wait for the new tab to open
    const demoShopPage = await newPagePromise;
    await demoShopPage.waitForLoadState('domcontentloaded');

    // Assert: New tab opens at correct URL
    expect(demoShopPage.url()).toBe(`http://localhost:5174/shop/${shopId}`);

    // Assert: No error boundary is shown
    const errorBoundary = demoShopPage.locator('text=/error|something went wrong/i');
    await expect(errorBoundary).not.toBeVisible();

    // Assert: DynamicComponentRenderer renders at least one component from seeded layout
    // Based on ExampleShopSeeder, the home page should have a HeaderNavigation component
    const renderedContent = demoShopPage.getByTestId('demo-shop-body');
    await expect(renderedContent).not.toBeEmpty();

    // Wait for any component to be rendered (seeded layout should contain components)
    // We look for common elements that would be in a header or section
    const hasContent = await demoShopPage.getByTestId('shop-container').locator('nav, header, section, main').count();
    expect(hasContent).toBeGreaterThan(0);

    // Clean up: close the demo shop tab
    await demoShopPage.close();
  });

  test('should redirect to login when not authenticated', async ({ page }) => {
    // Navigate directly to workspace without authentication
    await page.goto('/');

    // Should be redirected to login page or see login form
    await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {
      // If no redirect, check if we're on login page already
      expect(page.url()).toContain('/login');
    });

    // Verify login form is visible
    await expect(page.getByTestId('login-header')).toBeVisible();
  });
});

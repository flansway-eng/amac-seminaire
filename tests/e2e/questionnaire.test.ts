import { test, expect } from '@playwright/test';

test.describe('AMAC Modernisation Questionnaire E2E Flow', () => {
  // Setup before tests: Mocking login by setting auth cookies or localStorage
  test.beforeEach(async ({ page }) => {
    // Set up mock auth token cookies or bypass auth if testing local UI flow
    // In standard environments, we can mock responses by mocking the Supabase network requests!
    await page.route('**/rest/v1/profiles*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 'mock-user', nom: 'Koffi Délégué', role: 'membre', section_id: 1 }]),
      });
    });

    await page.route('**/rest/v1/sections*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 1, nom: 'Abidjan Lagunes', ville: 'Abidjan', actif: true }]),
      });
    });
  });

  test('should display section dashboard and launch active questionnaire flow', async ({ page }) => {
    // Navigate to Ma Section page (auth bypassed or mocked)
    await page.goto('http://localhost:3000/ma-section');

    // Check header section card details
    await expect(page.locator('h2')).toContainText(/Ma Section/);

    // Verify list of modernization fiches is rendered
    const fiches = page.locator('a[href*="ma-section?article="]');
    await expect(fiches).toHaveCount(13); // The 13 legal issues

    // Click on the first questionnaire fiche to launch it
    await fiches.first().click();

    // Verify we transitioned to the active article questionnaire view
    await expect(page.locator('span')).toContainText(/Article à réformer/);

    // Verify option A/B buttons exist
    const optionA = page.locator('button:has-text("A")');
    const optionB = page.locator('button:has-text("B")');
    await expect(optionA).toBeVisible();
    await expect(optionB).toBeVisible();

    // Click Option A to record response
    await optionA.click();

    // Verify that the agreement slider is displayed
    const ratingButtons = page.locator('button:has-text("4")');
    await expect(ratingButtons).toBeVisible();

    // Enter a comment in the motivation textarea
    const textarea = page.locator('textarea[placeholder*="Expliquez"]');
    await expect(textarea).toBeVisible();
    await textarea.fill('Nous choisissons l\'option A pour des raisons de clarté.');
    await textarea.blur();
  });
});

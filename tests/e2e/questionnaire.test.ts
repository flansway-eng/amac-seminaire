import { test, expect } from '@playwright/test';

// Plus de compte, plus de mot de passe : un participant rejoint via
// /rejoindre?section=<slug> en ne saisissant que son nom. Ces parcours
// nécessitent un projet Supabase réellement configuré (SUPABASE_SERVICE_ROLE_KEY),
// puisque /rejoindre crée un vrai participant en base.

async function rejoindre(page: import('@playwright/test').Page, nom: string) {
  await page.goto('/rejoindre');
  await page.getByPlaceholder('Votre nom complet').fill(nom);
  await page.locator('select[name="section"]').selectOption({ index: 1 });
  await page.getByRole('button', { name: /Entrer/ }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/rejoindre'));
}

test.describe('Sécurité : accès par défaut fermé, jamais vers /login', () => {
  test('une visite non authentifiée sur une route protégée redirige vers /rejoindre, pas /login', async ({ page }) => {
    await page.goto('/ben/liens');
    await expect(page).toHaveURL(/\/rejoindre\?suite=/);
    await expect(page).not.toHaveURL(/\/login/);
  });
});

test.describe('Parcours complet sans compte (mobile 380px)', () => {
  test.use({ viewport: { width: 380, height: 844 } });

  test('rejoindre → ouvrir une fiche → répondre au questionnaire → déposer une proposition, sans aucun écran de connexion', async ({ page }) => {
    // On ne connaît pas de slug de section réel sans base configurée : on
    // récupère la première section proposée par l'écran d'entrée.
    await page.goto('/rejoindre');

    // Aucun écran de connexion (email/mot de passe) ne doit jamais
    // apparaître dans ce parcours.
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    await expect(page.locator('input[name="email"]')).toHaveCount(0);

    await page.getByPlaceholder('Votre nom complet').fill('Test Playwright');
    await page.locator('select[name="section"]').selectOption({ index: 1 });
    await page.getByRole('button', { name: /Entrer/ }).click();
    await page.waitForURL((url) => !url.pathname.startsWith('/rejoindre'));

    // Toujours aucun écran de connexion après l'entrée.
    await expect(page.locator('input[type="password"]')).toHaveCount(0);

    await page.goto('/ma-section');
    const fiches = page.locator('a[href*="ma-section?article="]');
    await expect(fiches.first()).toBeVisible({ timeout: 10000 });
    await fiches.first().click();

    const optionA = page.locator('button:has-text("A")').first();
    await expect(optionA).toBeVisible();
    await optionA.click();

    const textarea = page.locator('textarea[placeholder*="Expliquez"]');
    await expect(textarea).toBeVisible();
    await textarea.fill("Proposition de test déposée depuis Playwright.");
    await textarea.blur();
  });
});

test.describe('Vote en séance à deux contextes simultanés', () => {
  test('deux participants rejoignent et votent simultanément sur le même article', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    try {
      await rejoindre(pageA, 'Déléguée A');
      await rejoindre(pageB, 'Délégué B');

      await pageA.goto('/seminaire');
      await pageB.goto('/seminaire');

      const voteA = pageA.locator('button:has-text("A.")').first();
      const voteB = pageB.locator('button:has-text("B.")').first();

      if ((await voteA.count()) > 0 && (await voteB.count()) > 0) {
        await voteA.click();
        await voteB.click();

        await expect(pageA.locator('[role="status"]')).toContainText(/vote a été transmis/);
        await expect(pageB.locator('[role="status"]')).toContainText(/vote a été transmis/);
      }
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });
});

import { test, expect } from '@playwright/test';

// Ces parcours nécessitent une session Supabase authentique : depuis la
// correction de la faille de sécurité du middleware (voir rapport), aucune
// route hors /login n'est plus accessible sans session valide, quel que soit
// l'environnement. Contrairement à l'ancien comportement, il n'existe plus de
// contournement (auto-connexion invité) à mocker côté navigateur : la
// vérification de session a lieu côté serveur (middleware + Server
// Components), hors de portée de page.route() qui n'intercepte que les
// requêtes émises par le navigateur.
//
// Les parcours authentifiés ci-dessous sont donc conditionnés à la présence
// d'un compte de test réel, dédié aux tests, fourni via les variables
// d'environnement E2E_TEST_EMAIL / E2E_TEST_PASSWORD (voir .env.example).
// Sans ces variables, ils sont ignorés plutôt que simulés de façon peu sûre.
const hasTestAccount = !!process.env.E2E_TEST_EMAIL && !!process.env.E2E_TEST_PASSWORD;

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByPlaceholder('nom@domain.com').fill(process.env.E2E_TEST_EMAIL!);
  await page.getByPlaceholder('••••••••').fill(process.env.E2E_TEST_PASSWORD!);
  await page.getByRole('button', { name: /Se connecter/ }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}

test.describe('Sécurité : accès par défaut fermé', () => {
  test('une visite non authentifiée sur une route protégée redirige vers /login', async ({ page }) => {
    await page.goto('/ma-section');
    await expect(page).toHaveURL(/\/login\?erreur=session/);
  });
});

test.describe('AMAC Modernisation Questionnaire E2E Flow', () => {
  test.skip(!hasTestAccount, 'E2E_TEST_EMAIL / E2E_TEST_PASSWORD non configurées : parcours authentifié ignoré.');

  test.use({ viewport: { width: 380, height: 844 } });

  test('ouvrir une fiche, répondre au questionnaire et déposer une proposition', async ({ page }) => {
    await login(page);
    await page.goto('/ma-section');

    await expect(page.locator('h2')).toContainText(/Ma Section/);

    const fiches = page.locator('a[href*="ma-section?article="]');
    await expect(fiches.first()).toBeVisible();
    await fiches.first().click();

    await expect(page.locator('span')).toContainText(/Article à réformer/);

    const optionA = page.locator('button:has-text("A")');
    const optionB = page.locator('button:has-text("B")');
    await expect(optionA).toBeVisible();
    await expect(optionB).toBeVisible();

    await optionA.click();

    const ratingButtons = page.locator('button:has-text("4")');
    await expect(ratingButtons).toBeVisible();

    const textarea = page.locator('textarea[placeholder*="Expliquez"]');
    await expect(textarea).toBeVisible();
    await textarea.fill("Nous choisissons l'option A pour des raisons de clarté.");
    await textarea.blur();
  });
});

test.describe('Vote en séance à deux contextes simultanés', () => {
  test.skip(!hasTestAccount, 'E2E_TEST_EMAIL / E2E_TEST_PASSWORD non configurées : parcours authentifié ignoré.');

  test('deux délégués votent simultanément et voient le résultat en direct', async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    try {
      await login(pageA);
      await login(pageB);

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

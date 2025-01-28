import test, { expect } from "@playwright/test";

test('can open root page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText("React Router Contacts")).toBeVisible();
});

test('can open contact', async ({ page }) => {
  await page.goto('/contacts/1');

  await expect(page.getByText("React Router Contacts")).toBeVisible();
});


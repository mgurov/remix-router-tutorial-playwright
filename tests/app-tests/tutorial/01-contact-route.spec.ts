import test, { expect } from "@playwright/test";

test('can open root page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText("React Router Contacts")).toBeVisible();

  await expect(page.getByText("Alex Anderson")).toBeVisible();
});

test('can open contact', async ({ page }) => {
  await page.goto('/contacts/1');

  await expect(page.getByText("React Router Contacts")).toBeVisible();
  await expect(page.getByAltText("Your Name avatar")).toBeVisible();
});


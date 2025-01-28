// /contacts/1

import test, { expect } from "@playwright/test";

test('can open root page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText("React Router Contacts")).toBeVisible();
});

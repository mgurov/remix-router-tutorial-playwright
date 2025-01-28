import test, { expect } from "@playwright/test";

test('can open root page', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText("React Router Contacts")).toBeVisible();

  await expect(page.getByText("Alex Anderson")).toBeVisible();

  await expect(page.getByTestId("index-page-hero")).toBeVisible();

});

test('can open contact', async ({ page }) => {
  await page.goto('/contacts/1');

  await expect(page.getByText("React Router Contacts")).toBeVisible();
  await expect(page.getByAltText("Your Name avatar")).toBeVisible();
});

test('can open about', async ({ page }) => {
  await page.goto('/about');

  await expect(page.getByText("About React Router Contacts")).toBeVisible();
});


test('can navigate to about', async ({ page }) => {
  await page.goto('/');

  await page.locator("div#sidebar").getByTestId("link-to-about").click()

  await page.waitForURL('/about')

  await expect(page.getByText("About React Router Contacts")).toBeVisible();
});


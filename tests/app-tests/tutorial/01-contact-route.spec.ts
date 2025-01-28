import test, { expect } from "@playwright/test";

test('can open root page', async ({ page }) => {

  await page.route('/api/contacts', route => route.fulfill({json: []}))

  await page.goto('/');

  await expect(page.getByText("React Router Contacts")).toBeVisible();

  await expect(page.getByTestId("index-page-hero")).toBeVisible();

});

test('can see contacts on the side bar', async ({ page }) => {

  await page.route('/api/contacts', route => route.fulfill({json: [
    {
      avatar:
        "https://sessionize.com/image/124e-400o400o2-wHVdAuNaxi8KJrgtN3ZKci.jpg",
      first: "Shruti",
      last: "Kapoor",
    },  
  ]}))

  await page.goto('/');

  await expect(page.locator("div#sidebar").getByText("Shruti Kapoor")).toBeVisible();

});

test('No contacts on the side bar when contact list is empty', async ({ page }) => {

  await page.route('/api/contacts', route => route.fulfill({json: []}))

  await page.goto('/');

  await expect(page.locator("div#sidebar")).toContainText("No contacts")

});

test('should show inline error when failed loading contacts', async ({ page }) => {

  await page.route('/api/contacts', route => route.fulfill({
    status: 404,
    body: "No contacts on this server",
  }))

  await page.goto('/');

  await expect(page.locator("div#sidebar")).toContainText("Error fetching contacts")

});


test('can open contact', async ({ page }) => {
  await page.route('/api/contacts', route => route.fulfill({json: []}))

  await page.goto('/contacts/1');

  await expect(page.getByText("React Router Contacts")).toBeVisible();
  await expect(page.getByAltText("Your Name avatar")).toBeVisible();
});

test('can open about', async ({ page }) => {
  await page.goto('/about');

  await expect(page.getByText("About React Router Contacts")).toBeVisible();
});


test('can navigate to about', async ({ page }) => {
  await page.route('/api/contacts', route => route.fulfill({json: []}))

  await page.goto('/');

  await page.locator("div#sidebar").getByText("React Router Contacts").click()

  await page.waitForURL('/about')

  await expect(page.getByText("About React Router Contacts")).toBeVisible();
});


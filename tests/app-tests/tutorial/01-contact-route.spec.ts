import test, { expect } from "@playwright/test";

test('can open root page', async ({ page }) => {

  await page.route('/api/contacts', route => route.fulfill({ json: [] }))

  await page.goto('/');

  await expect(page.getByText("React Router Contacts")).toBeVisible();

  await expect(page.getByTestId("index-page-hero")).toBeVisible();

});

test('can see contacts on the side bar', async ({ page }) => {

  await page.route('/api/contacts', route => route.fulfill({
    json: [
      {
        avatar: "https://placecats.com/200/200",
        first: "Fname",
        last: "Lname",
      },
    ]
  }));

  await page.goto('/');

  await expect(page.locator("div#sidebar").getByText("Fname Lname")).toBeVisible();

});

test('No contacts on the side bar when contact list is empty', async ({ page }) => {

  await page.route('/api/contacts', route => route.fulfill({ json: [] }))

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

test('can open about', async ({ page }) => {
  await page.goto('/about');

  await expect(page.getByText("About React Router Contacts")).toBeVisible();
});


test('can navigate to about', async ({ page }) => {
  await page.route('/api/contacts', route => route.fulfill({ json: [] }))

  await page.goto('/');

  await page.locator("div#sidebar").getByText("React Router Contacts").click()

  await page.waitForURL('/about')

  await expect(page.getByText("About React Router Contacts")).toBeVisible();
});

test('can navigate to contact', async ({ page }) => {
  await page.route('/api/contacts', route => route.fulfill({
    json: [
      {
        id: 'abcdef_gid',
        avatar:
          "https://placecats.com/200/200",
        first: "Fname",
        last: "Lname",
      },
    ]
  }))

  await page.route('/api/contacts/abcdef_gid', route => route.fulfill({
    json:
    {
      id: 'abcdef_gid',
      avatar: "https://placecats.com/200/200",
      first: "Fname",
      last: "Lname",
      notes: "Something special about this contact"
    },
  }))

  await page.goto('/');

  await page.locator("div#sidebar").getByText("Fname Lname").click()

  await page.waitForURL('/contacts/abcdef_gid')

  await expect(page.locator("div#contact")).toContainText("Fname Lname")
  await expect(page.locator("div#contact")).toContainText("Something special about this contact")
});

test('should show spinner while opening contact', async ({ page }) => {
  await page.route('/api/contacts', route => route.fulfill({ json: [] }))

  await page.route('/api/contacts/abcdef_gid', async route => {
    //await new Promise(resolve => {setTimeout(resolve, 5000)});
    return route.fulfill({
      json:
      {
        id: 'abcdef_gid',
        avatar: "https://placecats.com/200/200",
        first: "Fname",
        last: "Lname",
        notes: "Something special about this contact"
      },
    })
  });

  await page.goto('/contacts/abcdef_gid');

  //await page.waitForTimeout(500);

  await expect(page.locator("#loading-splash")).toBeVisible();
  await expect(page.locator("#loading-splash")).toContainText(/Loading,/);

  await expect(page.getByAltText("Fname Lname avatar")).toBeVisible();
});


test('should show error on fetching a contact', async ({ page }) => {
  await page.route('/api/contacts/abcdef_gid', route => route.fulfill({
    status: 500,
    body: "Computer says No."
  }))

  await page.goto('/contacts/abcdef_gid');

  await expect(page.locator("div#contact")).toContainText(/Error fetching contact/)
});

test('can edit contact', async ({ page }) => {
  await page.route('/api/contacts', route => route.fulfill({
    json: [
      {
        id: 'abcdef_gid',
        avatar:
          "https://placecats.com/200/200",
        first: "Fname",
        last: "Lname",
      },
    ]
  }))

  await page.route('/api/contacts/abcdef_gid', route => route.fulfill({
    json:
    {
      id: 'abcdef_gid',
      avatar: "https://placecats.com/200/200",
      first: "Fname",
      last: "Lname",
      notes: "Something special about this contact"
    },
  }))

  await page.goto('/contacts/abcdef_gid');

  await page.locator("div#contact button").getByText("Edit").click()

  await expect(page.locator("#contact-form").getByLabel('Avatar URL')).toHaveValue("https://placecats.com/200/200")

  await expect(page.locator("#contact-form").getByLabel('Notes')).toHaveValue("Something special about this contact")

  await page.locator("#contact-form").getByLabel('Notes').fill("Notes changed")

  await page.locator("#contact-form button").getByText("Save").click()

  await page.waitForURL('/contacts/abcdef_gid');
});
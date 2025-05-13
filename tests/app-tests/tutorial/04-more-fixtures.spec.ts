import Deferred from "./fixtures/Deferred";
import { test, expect } from "./fixtures/outtest";

test('can open root page', async ({ page }) => {

  await page.goto('/');

  await expect(page.getByText("React Router Contacts")).toBeVisible();

  await expect(page.getByTestId("index-page-hero")).toBeVisible();

});

test.describe("contact list", () => {

  test('can see contacts on the side bar', async ({ page, world, appPage }) => {

    world.givenContact({
      first: "Fname",
      last: "Lname",
    })

    await page.goto('/');

    await expect(appPage.sidebar.getByText("Fname Lname")).toBeVisible();

  });

  test('No contacts on the side bar when contact list is empty', async ({ page, appPage }) => {

    await page.goto('/');

    await expect(appPage.sidebar).toContainText("No contacts")

  });

  test('should show inline error when failed loading contacts', async ({ page, appPage }) => {

    await page.route('/api/contacts', route => route.fulfill({
      status: 404,
      body: "No contacts on this server",
    }))

    await page.goto('/');

    await expect(appPage.sidebar).toContainText("Error fetching contacts")

  });
})

test.describe("about", () => {
  test('can open about', async ({ page }) => {
    await page.goto('/about');

    await expect(page.getByText("About React Router Contacts")).toBeVisible();
  });


  test('can navigate to about', async ({ page, appPage }) => {

    await page.goto('/');

    await appPage.sidebar.getByText("React Router Contacts").click()

    await page.waitForURL('/about')

    await expect(page.getByText("About React Router Contacts")).toBeVisible();
  });
})

test.describe("contact view", () => {
  test('can navigate to contact', async ({ page, world, appPage }) => {

    const contact = world.givenContact({
      notes: "Something special about this contact",
    })

    await page.goto('/');

    await appPage.contactLink(contact).click()

    await page.waitForURL(`/contacts/${contact.id}`)

    await expect(page.locator("div#contact")).toContainText(contact.firstName)
    await expect(page.locator("div#contact")).toContainText(contact.lastName)
    await expect(page.locator("div#contact")).toContainText("Something special about this contact")
  });

  test('should show spinner while opening contact', async ({ page, world }) => {

    const contact = world.givenContact()

    const releaseRequest = new Deferred()

    await page.route('/api/contacts/' + contact.id, async route => {
      await releaseRequest.promise;
      return route.fallback();
    });

    await page.goto('/contacts/' + contact.id);

    //NB: don't use this at home.
    //await page.waitForTimeout(500);

    await expect(page.locator("#loading-splash")).toBeVisible();
    await expect(page.locator("#loading-splash")).toContainText(/Loading,/);

    releaseRequest.resolve("");

    await expect(page.getByAltText(/avatar/)).toBeVisible();
  });

  test('should show error on fetching a contact', async ({ page }) => {
    await page.route('/api/contacts/abcdef_gid', route => route.fulfill({
      status: 500,
      body: "Computer says No."
    }))

    await page.goto('/contacts/abcdef_gid');

    await expect(page.locator("div#contact")).toContainText(/Error fetching contact/)
  });
})


test.describe("contact edit", () => {

  test('can edit contact', async ({ page, world, appPage }) => {

    const contact = world.givenContact({
      notes: "Something special about this contact",
      avatar: "https://placecats.com/200/200",
    })

    await page.goto('/contacts/' + contact.id);

    const editContactPage = await appPage.openContactEditor();

    await page.waitForURL(`/contacts/${contact.id}/edit`);

    await expect(editContactPage.avatar).toHaveValue("https://placecats.com/200/200")

    await expect(editContactPage.notes).toHaveValue("Something special about this contact")

    await editContactPage.notes.fill("Notes changed")

    await editContactPage.saveButton.click()

    await page.waitForURL(`/contacts/${contact.id}/edit`);

    await expect(page.locator("div#contact")).toContainText("Notes changed")


  });

  test('should show error on edited contact saving', async ({ page, world }) => {
    const contact = world.givenContact()


    await page.route('/api/contacts/' + contact.id, async (route, request) => {
      if (request.method() === "PUT") {
        return route.fulfill({
          status: 400,
          json: {
            message: "something was wrong with the update"
          }
        })
      }
      return route.fallback();
    })


    await page.goto('/contacts/' + contact.id);

    await page.locator("div#contact button").getByText("Edit").click()

    await page.locator("#contact-form").getByLabel('Notes').fill("Notes changed")

    await page.locator("#contact-form button").getByText("Save").click()

    await expect(page.locator("#contact-form")).toContainText("Something went wrong")
  });

})
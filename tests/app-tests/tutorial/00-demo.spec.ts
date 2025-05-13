import Deferred from "./fixtures/Deferred";
import { test, expect } from "./fixtures/outtest";


test('can navigate to contact - direct dependency interception', async ({ page }) => {
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
})



test('can navigate to contact - worldly version', async ({ page, world, appPage }) => {

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




test('should show error on edited contact saving', async ({ page, world }) => {
  const contact = world.givenContact()


  await page.route(`/api/contacts/${contact.id}`, async (route, request) => {
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


test('should show spinner while opening contact', async ({ page, world }) => {

    const contact = world.givenContact()

    const releaseRequest = new Deferred()

    await page.route('/api/contacts/' + contact.id, async route => {
      await releaseRequest.promise;
      return route.fallback();
    });

    await page.goto('/contacts/' + contact.id);

    await expect(page.locator("#loading-splash")).toBeVisible();
    await expect(page.locator("#loading-splash")).toContainText(/Loading,/);

    releaseRequest.resolve("");

    await expect(page.getByAltText(/avatar/)).toBeVisible();
  });

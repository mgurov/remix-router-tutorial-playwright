import Deferred from "./fixtures/Deferred";
import { test, expect } from "./fixtures/outtest";

test('can navigate to contact - direct dependency interception', async ({ page, appPage }) => {
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

  await expect(page.locator("div#contact")).toContainText("Something special about this contact")
})


test('can navigate to contact - worldly version', async ({ page, world, appPage }) => {

  const contact = world.givenContact({
    notes: "Something special about this contact",
  })

  await page.goto('/');

  const contactSection = await appPage.clickToContact(contact)

  await expect(contactSection.notes).toContainText("Something special about this contact")
});




test('should show error on edited contact saving', async ({ page, world }) => {
  const contact = world.givenContact()


  await page.route(`/api/contacts/${contact.id}`, async (route, request) => {
    if (request.method() === "PUT") {
      return route.fulfill({
        status: 400,
        json: {
          message: "Computer says no"
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

  //TODO: comment me out for the demo.
  releaseRequest.resolve("");

  await expect(page.getByAltText(/avatar/)).toBeVisible();
});


test('shows last call - worldly version', async ({ world, appPage }) => {

  const contact = world.givenContact({
    lastContact: "2022-12-12T08:05:13Z",
  })

  const contactSection = await appPage.openContact(contact);
  await expect(contactSection.lastContact).toContainText('2022-12-12T08:05:13Z')

});

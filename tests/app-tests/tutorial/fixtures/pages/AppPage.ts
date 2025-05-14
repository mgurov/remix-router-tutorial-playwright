import type { Contact } from "../world";
import EditContactPage from "./EditContactPage";
import PageWrappingFixture from "./PageWrappingFixture";
import { test as baseTest, type Locator } from '@playwright/test';

export class AppPage extends PageWrappingFixture {
    get sidebar() {
        return this.page.locator("div#sidebar")
    }

    contactLink(contact: Contact): Locator {
        return this.sidebar.getByText(`${contact.firstName} ${contact.lastName}`)
    }

    async clickToContact(contact: Contact, opts: {waitForUrl?: boolean} = {}): Promise<ContactSection> {
        await this.contactLink(contact).click()
        if (!opts.waitForUrl === false) {
            await this.page.waitForURL(`/contacts/${contact.id}`)
        }
        return new ContactSection(this.page.locator("div#contact"))
    }

    
    async openContact(contact: {id: string}): Promise<ContactSection> {
        await this.page.goto(`/contacts/${contact.id}`)
        return new ContactSection(this.page.locator("div#contact"))
    }

    async openContactEditor(): Promise<EditContactPage> {
        await this.page.locator("div#contact button").getByText("Edit").click()
        return new EditContactPage(this.page);
    }
}

export class ContactSection extends PageWrappingFixture {
    get lastContact() {
        return this.getByTestId('last-contact')
    }

    get notes() {
        return this.getByTestId('notes')
    }
}

export const appPageTest = baseTest.extend<{ appPage: AppPage }>({
    appPage: async ({ page }, use) => {
      await use(new AppPage(page));
    },
});
  
  
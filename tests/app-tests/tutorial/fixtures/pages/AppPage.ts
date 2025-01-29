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

    async openContactEditor(): Promise<EditContactPage> {
        await this.page.locator("div#contact button").getByText("Edit").click()
        return new EditContactPage(this.page);
    }
}

export const appPageTest = baseTest.extend<{ appPage: AppPage }>({
    appPage: async ({ page }, use) => {
      await use(new AppPage(page));
    },
});
  
  
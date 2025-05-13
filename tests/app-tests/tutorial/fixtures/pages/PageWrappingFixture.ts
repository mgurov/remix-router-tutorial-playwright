import type { Locator, Page } from "@playwright/test";

export default class PageWrappingFixture {
  public page: Page;
  constructor(public location: Page | Locator) {
    if ('page' in location) {
      this.page = location.page();
    } else {
      this.page = location;
    }
  }

  getByText(text: string | RegExp, options?: { exact?: boolean }): Locator {
    return this.page.getByText(text, options);
  }

  getByTestId(testId: string | RegExp): Locator {
    return this.page.getByTestId(testId);
  }

  getReact(componentName: string): Locator {
    return this.page.locator(`_react=${componentName}`);
  }
}

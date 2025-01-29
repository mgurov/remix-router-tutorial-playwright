import type { Locator, Page } from "@playwright/test";

export default class PageWrappingFixture {
    constructor(public page: Page) {
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
  
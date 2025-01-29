import { mergeTests } from '@playwright/test';
import { worldlyTest } from './world'
import { appPageTest } from './pages/AppPage';

export const test = mergeTests(
    worldlyTest,
    appPageTest,
//    localStorageTest,
//    routingTest,
  
    // better be the last
//    playwrightMarkedTest
  );
  export { expect } from '@playwright/test';
  
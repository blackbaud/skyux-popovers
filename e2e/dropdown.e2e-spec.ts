import {
  expect,
  SkyHostBrowser
} from '@skyux-sdk/e2e';

import { element, by } from 'protractor';

describe('Dropdown', () => {
  it('should match dropdown button screenshot when closed', (done) => {
    SkyHostBrowser.get('visual/dropdown');
    SkyHostBrowser.setWindowBreakpoint('lg');
    expect('#screenshot-dropdown-button').toMatchBaselineScreenshot(done, {
      screenshotName: 'dropdown-button-closed'
    });
  });

  it('should match dropdown button screenshot when open', (done) => {
    SkyHostBrowser.get('visual/dropdown');
    SkyHostBrowser.setWindowBreakpoint('lg');
    element(by.css('#screenshot-dropdown-button .sky-dropdown-button')).click();
    expect('#screenshot-dropdown-button').toMatchBaselineScreenshot(done, {
      screenshotName: 'dropdown-button-open'
    });
  });

  it('should match dropdown context menu screenshot when closed', (done) => {
    SkyHostBrowser.get('visual/dropdown');
    SkyHostBrowser.setWindowBreakpoint('lg');
    expect('#screenshot-dropdown-context-menu').toMatchBaselineScreenshot(done, {
      screenshotName: 'dropdown-context-menu-closed'
    });
  });

  it('should match dropdown context menu screenshot when open', (done) => {
    SkyHostBrowser.get('visual/dropdown');
    SkyHostBrowser.setWindowBreakpoint('lg');
    element(by.css('#screenshot-dropdown-context-menu .sky-dropdown-button')).click();
    expect('#screenshot-dropdown-context-menu').toMatchBaselineScreenshot(done, {
      screenshotName: 'dropdown-context-menu-open'
    });
  });

  it('should match dropdown screenshot when before a relative element', (done) => {
    SkyHostBrowser.get('visual/dropdown');
    SkyHostBrowser.setWindowBreakpoint('lg');
    element(by.css('#screenshot-dropdown-z-index .sky-dropdown-button')).click();
    expect('#screenshot-dropdown-z-index').toMatchBaselineScreenshot(done, {
      screenshotName: 'dropdown-z-index'
    });
  });
});

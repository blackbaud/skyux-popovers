import {
  expect,
  SkyHostBrowser
} from '@skyux-sdk/e2e';

import {
  element,
  by
} from 'protractor';

describe('Popover', () => {
  const testPopoverPlacement = (placement: string, done: DoneFn) => {
    SkyHostBrowser.scrollTo(`#screenshot-popover-placements`);
    element(by.id(`btn-popover-placement-${placement}`)).click();
    expect('#screenshot-popover-placements').toMatchBaselineScreenshot(done, {
      screenshotName: `popover-placement-${placement}`
    });
  };

  it('should match previous screenshot', (done) => {
    SkyHostBrowser.get('visual/popover');
    SkyHostBrowser.setWindowBreakpoint('lg');
    expect('#screenshot-all-popovers').toMatchBaselineScreenshot(done, {
      screenshotName: 'popover-all-popovers'
    });
  });

  it('should open a popover above the caller', (done) => {
    SkyHostBrowser.get('visual/popover');
    SkyHostBrowser.setWindowBreakpoint('lg');
    testPopoverPlacement('above', done);
  });

  it('should open a popover above-left the caller', (done) => {
    SkyHostBrowser.get('visual/popover');
    SkyHostBrowser.setWindowBreakpoint('lg');
    testPopoverPlacement('above-left', done);
  });

  it('should open a popover above-right the caller', (done) => {
    SkyHostBrowser.get('visual/popover');
    SkyHostBrowser.setWindowBreakpoint('lg');
    testPopoverPlacement('above-right', done);
  });

  it('should open a popover below-left the caller', (done) => {
    SkyHostBrowser.get('visual/popover');
    SkyHostBrowser.setWindowBreakpoint('lg');
    testPopoverPlacement('below-left', done);
  });

  it('should open a popover below-right the caller', (done) => {
    SkyHostBrowser.get('visual/popover');
    SkyHostBrowser.setWindowBreakpoint('lg');
    testPopoverPlacement('below-right', done);
  });

  it('should open a popover below the caller', (done) => {
    SkyHostBrowser.get('visual/popover');
    SkyHostBrowser.setWindowBreakpoint('lg');
    testPopoverPlacement('below', done);
  });

  it('should open a popover to the right of the caller', (done) => {
    SkyHostBrowser.get('visual/popover');
    SkyHostBrowser.setWindowBreakpoint('lg');
    testPopoverPlacement('right', done);
  });

  it('should open a popover to the left of the caller', (done) => {
    SkyHostBrowser.get('visual/popover');
    SkyHostBrowser.setWindowBreakpoint('lg');
    testPopoverPlacement('left', done);
  });

  it('should handle tiny screens', (done) => {
    SkyHostBrowser.get('visual/popover');
    SkyHostBrowser.setWindowBreakpoint('xs');
    SkyHostBrowser.scrollTo(`#screenshot-popover-tiny`);
    element(by.id(`btn-popover-tiny`)).click();
    expect('#screenshot-popover-tiny').toMatchBaselineScreenshot(done, {
      screenshotName: 'popover-tiny-screen'
    });
  });

  it('should handle absolutely positioned items inside the popover', (done) => {
    SkyHostBrowser.get('visual/popover');
    SkyHostBrowser.setWindowBreakpoint('lg');
    SkyHostBrowser.scrollTo('#screenshot-popover-with-dropdown');
    element(by.id('btn-popover-with-dropdown')).click();
    element(by.css('#screenshot-popover-with-dropdown .sky-dropdown-button')).click();
    expect('#screenshot-popover-with-dropdown').toMatchBaselineScreenshot(done, {
      screenshotName: 'popover-with-dropdown'
    });
  });

  it('should handle left aligned popover in positioned parent', (done) => {
    SkyHostBrowser.get('visual/popover');
    SkyHostBrowser.setWindowBreakpoint('lg');
    SkyHostBrowser.scrollTo('#screenshot-popover-positioned-parent');
    element(by.id('btn-popover-position-parent-left')).click();
    element(by.css('#popover-positioned-parent-container-left .sky-dropdown-button')).click();
    expect('#screenshot-popover-positioned-parent').toMatchBaselineScreenshot(done, {
      screenshotName: 'popover-position-parent-left'
    });
  });

  it('should handle right aligned popover in positioned parent', (done) => {
    SkyHostBrowser.get('visual/popover');
    SkyHostBrowser.setWindowBreakpoint('lg');
    SkyHostBrowser.scrollTo('#screenshot-popover-positioned-parent');
    element(by.id('btn-popover-position-parent-right')).click();
    element(by.css('#popover-positioned-parent-container-right .sky-dropdown-button')).click();
    expect('#screenshot-popover-positioned-parent').toMatchBaselineScreenshot(done, {
      screenshotName: 'popover-position-parent-right'
    });
  });

  it('should open a fullscreen popover', (done) => {
    SkyHostBrowser.get('visual/popover');
    SkyHostBrowser.setWindowBreakpoint('lg');
    SkyHostBrowser.scrollTo('#screenshot-popover-fullscreen');
    element(by.id('btn-popover-fullscreen')).click();
    expect('.sky-popover-container.sky-popover-placement-fullscreen').toMatchBaselineScreenshot(done, {
      screenshotName: 'popover-fullscreen'
    });
  });
});

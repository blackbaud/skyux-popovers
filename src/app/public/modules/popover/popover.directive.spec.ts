import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';

import {
  expect, SkyAppTestUtility
} from '@skyux-sdk/testing';
import {
  SkyOverlayService
} from '@skyux/core';

import {
  PopoverFixtureComponent
} from './fixtures/popover.component.fixture';

import {
  PopoverFixturesModule
} from './fixtures/popover.module.fixture';

import { SkyPopoverMessageType } from './types';

describe('Popover directive', () => {

  let fixture: ComponentFixture<PopoverFixtureComponent>;

  function getCallerElement(): HTMLButtonElement {
    return fixture.componentInstance.callerElementRef.nativeElement;
  }

  function getPopoverElement(): HTMLElement {
    return fixture.componentInstance.popoverRef['popoverContainer'].nativeElement;
  }

  function isElementFocused(elem: Element): boolean {
    return (elem === document.activeElement);
  }

  function isElementVisible(elem: Element): boolean {
    return (getComputedStyle(elem).visibility !== 'hidden');
  }

  function detectChanges(): void {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        PopoverFixturesModule
      ]
    });

    fixture = TestBed.createComponent(PopoverFixtureComponent);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should set defaults', fakeAsync(() => {
    detectChanges();

    const directiveRef = fixture.componentInstance.directiveRef;
    expect(directiveRef.skyPopoverAlignment).toBeUndefined();
    expect(directiveRef.skyPopoverPlacement).toBeUndefined();
    expect(directiveRef.skyPopoverTrigger).toEqual('click');

    const popoverRef = fixture.componentInstance.popoverRef;
    expect(popoverRef.alignment).toEqual('center');
    expect(popoverRef.allowFullscreen).toEqual(true);
    expect(popoverRef.dismissOnBlur).toEqual(true);
    expect(popoverRef.isStatic).toEqual(false);
    expect(popoverRef.placement).toEqual('above');
    expect(popoverRef.popoverTitle).toBeUndefined();
  }));

  describe('mouse interactions', function () {
    it('should open and close the popover via mouse click', fakeAsync(() => {
      fixture.componentInstance.trigger = 'click';

      detectChanges();

      const button = getCallerElement();

      button.click();
      // Simulate mouse movement as well.
      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');

      detectChanges();

      const popover = getPopoverElement();
      expect(isElementVisible(popover)).toEqual(true);

      button.click();
      // // Simulate mouse movement as well.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');

      detectChanges();

      expect(isElementVisible(popover)).toEqual(false);
    }));

    it('should open and close popover via mouse hover', fakeAsync(() => {
      fixture.componentInstance.trigger = 'mouseenter';

      detectChanges();

      const button = getCallerElement();
      const popover = getPopoverElement();

      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');

      detectChanges();

      expect(isElementVisible(popover)).toEqual(true);

      // Simulate moving the mouse to the popover.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');
      SkyAppTestUtility.fireDomEvent(popover, 'mouseenter');

      detectChanges();

      // Confirm popover is still open.
      expect(isElementVisible(popover)).toEqual(true);

      // Simulate moving the mouse from the popover to the trigger button.
      SkyAppTestUtility.fireDomEvent(popover, 'mouseleave');
      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');

      detectChanges();

      // Confirm popover is still open.
      expect(isElementVisible(popover)).toEqual(true);

      // Simulate mouse leaving the trigger button.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');

      detectChanges();

      // Menu should now be closed.
      expect(isElementVisible(popover)).toEqual(false);

      // Re-open the popover.
      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');

      detectChanges();

      expect(isElementVisible(popover)).toEqual(true);

      // Simulate moving the mouse to the popover.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');
      SkyAppTestUtility.fireDomEvent(popover, 'mouseenter');

      detectChanges();

      // Confirm popover is still open.
      expect(isElementVisible(popover)).toEqual(true);

      // Simulate mouse leaving the popover completely.
      SkyAppTestUtility.fireDomEvent(popover, 'mouseleave');

      detectChanges();

      // Menu should now be closed.
      expect(isElementVisible(popover)).toEqual(false);
    }));

    // it('should close popover when clicking outside', fakeAsync(() => {
    //   fixture.detectChanges();
    //   tick();

    //   const button = getButtonElement();
    //   const container = getMenuContainerElement();

    //   button.click();
    //   fixture.detectChanges();
    //   tick();

    //   expect(isElementVisible(container)).toEqual(true);

    //   SkyAppTestUtility.fireDomEvent(window.document, 'click');
    //   fixture.detectChanges();
    //   tick();

    //   expect(isElementVisible(container)).toEqual(false);
    // }));

    // it('should allow preventing popover close on window click', fakeAsync(() => {
    //   fixture.componentInstance.dismissOnBlur = false;
    //   fixture.detectChanges();
    //   tick();

    //   const button = getButtonElement();
    //   const container = getMenuContainerElement();

    //   button.click();
    //   fixture.detectChanges();
    //   tick();

    //   expect(isElementVisible(container)).toEqual(true);

    //   SkyAppTestUtility.fireDomEvent(window.document, 'click');
    //   fixture.detectChanges();
    //   tick();

    //   // Menu should still be open.
    //   expect(isElementVisible(container)).toEqual(true);
    // }));
  });

});

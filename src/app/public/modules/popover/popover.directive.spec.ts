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

  function getFocusableItems(): NodeListOf<Element> {
    return getPopoverElement().querySelectorAll('input, button');
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
    // fixture.destroy();
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

  it('should place the popover on all four sides of the caller', fakeAsync(() => {
    fixture.componentInstance.placement = 'above';
    detectChanges();

    const button = getCallerElement();
    button.click();
    detectChanges();

    let popover = getPopoverElement();

    expect(popover).toHaveCssClass('sky-popover-placement-above');

    fixture.componentInstance.placement = 'right';
    detectChanges();

    popover = getPopoverElement();

    expect(popover).toHaveCssClass('sky-popover-placement-right');

    fixture.componentInstance.placement = 'below';
    detectChanges();

    popover = getPopoverElement();

    expect(popover).toHaveCssClass('sky-popover-placement-below');

    fixture.componentInstance.placement = 'left';
    detectChanges();

    popover = getPopoverElement();

    expect(popover).toHaveCssClass('sky-popover-placement-left');
  }));

  it('should display popovers as fullscreen', fakeAsync(() => {}));

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

      // Re-open the popover.
      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');
      // Simulate mouse leaving trigger button before entering the popover.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');

      detectChanges();
      detectChanges();

      expect(isElementVisible(popover)).toEqual(false);
    }));

    it('should close popover when clicking outside', fakeAsync(() => {
      detectChanges();

      const button = getCallerElement();
      const popover = getPopoverElement();

      button.click();
      detectChanges();

      expect(isElementVisible(popover)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(window.document, 'click');
      detectChanges();

      expect(isElementVisible(popover)).toEqual(false);
    }));

    it('should allow preventing popover close on window click', fakeAsync(() => {
      fixture.componentInstance.dismissOnBlur = false;
      detectChanges();

      const button = getCallerElement();
      const popover = getPopoverElement();

      button.click();
      detectChanges();

      expect(isElementVisible(popover)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(window.document, 'click');
      detectChanges();

      // Menu should still be open.
      expect(isElementVisible(popover)).toEqual(true);
    }));
  });

  describe('keyboard interactions', function () {
    it('should close popover with escape key while trigger button is focused', fakeAsync(() => {
      detectChanges();

      const button = getCallerElement();
      const popover = getPopoverElement();

      button.click();
      detectChanges();

      expect(isElementVisible(popover)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(button, 'keyup', {
        keyboardEventInit: {
          key: 'escape'
        }
      });

      detectChanges();

      expect(isElementVisible(popover)).toEqual(false);

      const messageSpy = spyOn(fixture.componentInstance.messageStream, 'next').and.callThrough();

      // Escape key detection shouldn't work while the popover is closed.
      SkyAppTestUtility.fireDomEvent(button, 'keyup', {
        keyboardEventInit: {
          key: 'escape'
        }
      });

      detectChanges();

      expect(messageSpy).not.toHaveBeenCalled();
    }));

    it('should close popover with escape key while popover is focused', fakeAsync(() => {
      detectChanges();

      const button = getCallerElement();
      const popover = getPopoverElement();

      button.click();
      detectChanges();

      expect(isElementVisible(popover)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(popover, 'keyup', {
        keyboardEventInit: {
          key: 'escape'
        }
      });

      detectChanges();

      expect(isElementVisible(popover)).toEqual(false);
      expect(isElementFocused(button)).toEqual(true);
    }));

    it('should focus popover with arrow keys', fakeAsync(() => {
      detectChanges();

      const button = getCallerElement();
      const popover = getPopoverElement().querySelector('.sky-popover');

      // Open the popover.
      button.click();
      detectChanges();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'arrowleft'
        }
      });

      detectChanges();

      expect(isElementFocused(popover)).toEqual(true);

      // Move focus to the button.
      button.focus();

      expect(isElementFocused(popover)).toEqual(false);

      // Test IE11-specific key names.
      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'left'
        }
      });

      detectChanges();

      expect(isElementFocused(popover)).toEqual(true);

      // Close the popover.
      button.click();
      detectChanges();

      const messageSpy = spyOn(fixture.componentInstance.messageStream, 'next').and.callThrough();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'arrowleft'
        }
      });

      detectChanges();

      // The arrow key event listeners should have no effect when the popover is closed.
      expect(messageSpy).not.toHaveBeenCalled();
    }));

    it('should close the popover after popover loses focus', fakeAsync(() => {
      fixture.componentInstance.showFocusableChildren = true;
      detectChanges();

      const button = getCallerElement();
      const popover = getPopoverElement();
      const focusableItems = getFocusableItems();

      // Open and bring focus to the popover.
      button.click();
      detectChanges();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'arrowup'
        }
      });

      detectChanges();

      // Confirm the first focusable item has focus.
      expect(isElementFocused(focusableItems.item(0))).toEqual(true);

      // Press 'shift+tab' to close the popover
      SkyAppTestUtility.fireDomEvent(focusableItems.item(0), 'keydown', {
        keyboardEventInit: {
          key: 'tab',
          shiftKey: true
        }
      });

      detectChanges();

      // The popover should be closed and trigger button focused.
      expect(isElementVisible(popover)).toEqual(false);
      expect(isElementFocused(button)).toEqual(true);

      // Re-open and bring focus to the popover.
      button.click();
      detectChanges();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'arrowright'
        }
      });

      detectChanges();

      // Focus the last item and press 'tab' to close the popover.
      (focusableItems.item(1) as HTMLElement).focus();
      detectChanges();

      SkyAppTestUtility.fireDomEvent(focusableItems.item(1), 'keydown', {
        keyboardEventInit: {
          key: 'tab'
        }
      });

      detectChanges();

      // The popover should be closed and trigger button focused.
      expect(isElementVisible(popover)).toEqual(false);
      expect(isElementFocused(button)).toEqual(true);
    }));
  });

  describe('message stream', function () {
    it('should open and close the popover', fakeAsync(() => {
      detectChanges();

      const popover = getPopoverElement();

      // Verify the popover is closed on startup.
      expect(isElementVisible(popover)).toEqual(false);

      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Open);
      detectChanges();

      expect(isElementVisible(popover)).toEqual(true);

      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Close);
      detectChanges();

      expect(isElementVisible(popover)).toEqual(false);
    }));

    it('should focus the popover', fakeAsync(() => {
      detectChanges();

      const popover = getPopoverElement().querySelector('.sky-popover');

      expect(isElementFocused(popover)).toEqual(false);

      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Open);
      detectChanges();

      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Focus);
      detectChanges();

      expect(isElementFocused(popover)).toEqual(true);

      const applyFocusSpy = spyOn(
        fixture.componentInstance.popoverRef['coreAdapterService'],
        'getFocusableChildrenAndApplyFocus'
      ).and.callThrough();

      // The focus message shouldn't register when the popover is closed.
      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Close);
      detectChanges();
      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Focus);
      detectChanges();
      expect(applyFocusSpy).not.toHaveBeenCalled();
    }));

    it('should allow repositioning the popover', fakeAsync(() => {
      detectChanges();

      const affixer = fixture.componentInstance.popoverRef['affixer'];
      const affixSpy = spyOn(affixer, 'reaffix').and.callThrough();

      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Reposition);
      detectChanges();

      // Repositioning should only happen if popover is open.
      expect(affixSpy).not.toHaveBeenCalledWith();
      affixSpy.calls.reset();

      // Open the popover.
      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Open);
      detectChanges();

      // Reposition the popover.
      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Reposition);
      detectChanges();

      // The affixing method should be called now.
      expect(affixSpy).toHaveBeenCalled();
    }));
  });

});

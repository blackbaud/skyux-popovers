import {
  ComponentFixture,
  fakeAsync,
  inject,
  TestBed,
  tick
} from '@angular/core/testing';

import {
  expect,
  SkyAppTestUtility
} from '@skyux-sdk/testing';

import {
  SkyAffixService
} from '@skyux/core';

import {
  Subject
} from 'rxjs/Subject';

import {
  PopoverFixtureComponent
} from './fixtures/popover.component.fixture';

import {
  PopoverFixturesModule
} from './fixtures/popover.module.fixture';

import {
  SkyPopoverMessageType
} from './types/popover-message-type';

import {
  SkyPopoverAdapterService
} from './popover-adapter.service';

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

  function detectChangesFakeAsync(): void {
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
    fixture.destroy();
  });

  it('should set defaults', fakeAsync(() => {
    detectChangesFakeAsync();

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
    detectChangesFakeAsync();

    const button = getCallerElement();
    const popover = getPopoverElement();

    button.click();
    detectChangesFakeAsync();

    expect(popover).toHaveCssClass('sky-popover-placement-above');

    button.click();
    detectChangesFakeAsync();

    fixture.componentInstance.placement = 'right';
    detectChangesFakeAsync();

    button.click();
    detectChangesFakeAsync();

    expect(popover).toHaveCssClass('sky-popover-placement-right');

    button.click();
    detectChangesFakeAsync();

    fixture.componentInstance.placement = 'below';
    detectChangesFakeAsync();

    button.click();
    detectChangesFakeAsync();

    expect(popover).toHaveCssClass('sky-popover-placement-below');

    button.click();
    detectChangesFakeAsync();

    fixture.componentInstance.placement = 'left';
    detectChangesFakeAsync();

    button.click();
    detectChangesFakeAsync();

    expect(popover).toHaveCssClass('sky-popover-placement-left');
  }));

  it('should set horizontal alignments', fakeAsync(() => {
    fixture.componentInstance.placement = 'above';
    fixture.componentInstance.alignment = 'left';
    detectChangesFakeAsync();

    const button = getCallerElement();
    const popover = getPopoverElement();

    button.click();
    detectChangesFakeAsync();

    expect(popover).toHaveCssClass('sky-popover-alignment-left');

    button.click();
    detectChangesFakeAsync();

    fixture.componentInstance.alignment = 'center';
    detectChangesFakeAsync();

    button.click();
    detectChangesFakeAsync();

    expect(popover).toHaveCssClass('sky-popover-alignment-center');

    button.click();
    detectChangesFakeAsync();

    fixture.componentInstance.alignment = 'right';
    detectChangesFakeAsync();

    button.click();
    detectChangesFakeAsync();

    expect(popover).toHaveCssClass('sky-popover-alignment-right');
  }));

  it('should allow static mode', fakeAsync(() => {
    fixture.componentInstance.isStatic = true;
    detectChangesFakeAsync();
    const popoverInFixture = fixture.nativeElement.querySelector('sky-popover');
    expect(popoverInFixture).toBeTruthy();
  }));

  it('should add scrollbars for tall popover', fakeAsync(() => {
    detectChangesFakeAsync();

    const button = getCallerElement();

    button.click();
    detectChangesFakeAsync();

    const popover = getPopoverElement().querySelector('.sky-popover');

    // Should NOT have a scrollbar.
    expect(popover.scrollHeight > popover.clientHeight).toEqual(false);

    fixture.componentInstance.allowFullscreen = false; // <-- this is important
    fixture.componentInstance.setHeight(4000);
    fixture.componentInstance.sendMessage(SkyPopoverMessageType.Close);
    detectChangesFakeAsync();

    fixture.componentInstance.sendMessage(SkyPopoverMessageType.Open);
    detectChangesFakeAsync();

    // Should now have a scrollbar.
    expect(popover.scrollHeight > popover.clientHeight).toEqual(true);
  }));

  it('should prevent the arrow from leaving the popover', fakeAsync(() => {
    fixture.componentInstance.placement = 'right';
    detectChangesFakeAsync();

    // TODO: make the window have a scroll bar and scroll to all ends to check the arrow?
  }));

  describe('mouse interactions', function () {
    it('should open and close the popover via mouse click', fakeAsync(() => {
      fixture.componentInstance.trigger = 'click';

      detectChangesFakeAsync();

      const button = getCallerElement();

      button.click();
      // Simulate mouse movement as well.
      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');

      detectChangesFakeAsync();

      const popover = getPopoverElement();
      expect(isElementVisible(popover)).toEqual(true);

      button.click();
      // Simulate mouse movement as well.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');

      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(false);
    }));

    it('should open and close popover via mouse hover', fakeAsync(() => {
      fixture.componentInstance.trigger = 'mouseenter';

      detectChangesFakeAsync();

      const button = getCallerElement();
      const popover = getPopoverElement();

      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');

      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(true);

      // Simulate moving the mouse to the popover.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');
      SkyAppTestUtility.fireDomEvent(popover, 'mouseenter');

      detectChangesFakeAsync();

      // Confirm popover is still open.
      expect(isElementVisible(popover)).toEqual(true);

      // Simulate moving the mouse from the popover to the trigger button.
      SkyAppTestUtility.fireDomEvent(popover, 'mouseleave');
      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');

      detectChangesFakeAsync();

      // Confirm popover is still open.
      expect(isElementVisible(popover)).toEqual(true);

      // Simulate mouse leaving the trigger button.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');

      detectChangesFakeAsync();

      // Menu should now be closed.
      expect(isElementVisible(popover)).toEqual(false);

      // Re-open the popover.
      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');

      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(true);

      // Simulate moving the mouse to the popover.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');
      SkyAppTestUtility.fireDomEvent(popover, 'mouseenter');

      detectChangesFakeAsync();

      // Confirm popover is still open.
      expect(isElementVisible(popover)).toEqual(true);

      // Simulate mouse leaving the popover completely.
      SkyAppTestUtility.fireDomEvent(popover, 'mouseleave');

      detectChangesFakeAsync();

      // Menu should now be closed.
      expect(isElementVisible(popover)).toEqual(false);

      // Re-open the popover.
      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');
      // Simulate mouse leaving trigger button before entering the popover.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');

      detectChangesFakeAsync();
      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(false);
    }));

    it('should close popover when clicking outside', fakeAsync(() => {
      detectChangesFakeAsync();

      const button = getCallerElement();
      const popover = getPopoverElement();

      button.click();
      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(window.document, 'click');
      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(false);
    }));

    it('should allow preventing popover close on window click', fakeAsync(() => {
      fixture.componentInstance.dismissOnBlur = false;
      detectChangesFakeAsync();

      const button = getCallerElement();
      const popover = getPopoverElement();

      button.click();
      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(window.document, 'click');
      detectChangesFakeAsync();

      // Menu should still be open.
      expect(isElementVisible(popover)).toEqual(true);
    }));
  });

  describe('keyboard interactions', function () {
    it('should close popover with escape key while trigger button is focused', fakeAsync(() => {
      detectChangesFakeAsync();

      const button = getCallerElement();
      const popover = getPopoverElement();

      button.click();
      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(button, 'keyup', {
        keyboardEventInit: {
          key: 'escape'
        }
      });

      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(false);

      const messageSpy = spyOn(fixture.componentInstance.messageStream, 'next').and.callThrough();

      // Escape key detection shouldn't work while the popover is closed.
      SkyAppTestUtility.fireDomEvent(button, 'keyup', {
        keyboardEventInit: {
          key: 'escape'
        }
      });

      detectChangesFakeAsync();

      expect(messageSpy).not.toHaveBeenCalled();
    }));

    it('should close popover with escape key while popover is focused', fakeAsync(() => {
      detectChangesFakeAsync();

      const button = getCallerElement();
      const popover = getPopoverElement();

      button.click();
      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(popover, 'keyup', {
        keyboardEventInit: {
          key: 'escape'
        }
      });

      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(false);
      expect(isElementFocused(button)).toEqual(true);
    }));

    it('should focus popover with arrow keys', fakeAsync(() => {
      detectChangesFakeAsync();

      const button = getCallerElement();
      const popover = getPopoverElement().querySelector('.sky-popover');

      // Open the popover.
      button.click();
      detectChangesFakeAsync();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'arrowleft'
        }
      });

      detectChangesFakeAsync();

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

      detectChangesFakeAsync();

      expect(isElementFocused(popover)).toEqual(true);

      // Close the popover.
      button.click();
      detectChangesFakeAsync();

      const messageSpy = spyOn(fixture.componentInstance.messageStream, 'next').and.callThrough();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'arrowleft'
        }
      });

      detectChangesFakeAsync();

      // The arrow key event listeners should have no effect when the popover is closed.
      expect(messageSpy).not.toHaveBeenCalled();
    }));

    it('should close the popover after popover loses focus', fakeAsync(() => {
      fixture.componentInstance.showFocusableChildren = true;
      detectChangesFakeAsync();

      const button = getCallerElement();
      const popover = getPopoverElement();
      const focusableItems = getFocusableItems();

      // Open and bring focus to the popover.
      button.click();
      detectChangesFakeAsync();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'arrowup'
        }
      });
      // Also confirm focusin event fires correctly.
      SkyAppTestUtility.fireDomEvent(focusableItems.item(0), 'focusin');

      detectChangesFakeAsync();

      // Confirm the first focusable item has focus.
      expect(isElementFocused(focusableItems.item(0))).toEqual(true);

      // Press 'shift+tab' to close the popover
      SkyAppTestUtility.fireDomEvent(focusableItems.item(0), 'keydown', {
        keyboardEventInit: {
          key: 'tab',
          shiftKey: true
        }
      });

      detectChangesFakeAsync();

      // The popover should be closed and trigger button focused.
      expect(isElementVisible(popover)).toEqual(false);
      expect(isElementFocused(button)).toEqual(true);

      // Re-open and bring focus to the popover.
      button.click();
      detectChangesFakeAsync();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'arrowright'
        }
      });

      detectChangesFakeAsync();

      // Focus the last item and press 'tab' to close the popover.
      (focusableItems.item(1) as HTMLElement).focus();
      detectChangesFakeAsync();

      SkyAppTestUtility.fireDomEvent(focusableItems.item(1), 'keydown', {
        keyboardEventInit: {
          key: 'tab'
        }
      });

      detectChangesFakeAsync();

      // The popover should be closed and trigger button focused.
      expect(isElementVisible(popover)).toEqual(false);
      expect(isElementFocused(button)).toEqual(true);
    }));

    it('should close the popover after trigger loses focus', fakeAsync(() => {
      detectChangesFakeAsync();

      const button = getCallerElement();
      const popover = getPopoverElement();

      button.click();
      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(window.document, 'focusin');
      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(false);
    }));
  });

  describe('message stream', function () {
    it('should open and close the popover', fakeAsync(() => {
      detectChangesFakeAsync();

      const popover = getPopoverElement();

      // Verify the popover is closed on startup.
      expect(isElementVisible(popover)).toEqual(false);

      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Open);
      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(true);

      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Close);
      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(false);
    }));

    it('should focus the popover', fakeAsync(() => {
      detectChangesFakeAsync();

      const popover = getPopoverElement().querySelector('.sky-popover');

      expect(isElementFocused(popover)).toEqual(false);

      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Open);
      detectChangesFakeAsync();

      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Focus);
      detectChangesFakeAsync();

      expect(isElementFocused(popover)).toEqual(true);

      const applyFocusSpy = spyOn(
        fixture.componentInstance.popoverRef['coreAdapterService'],
        'getFocusableChildrenAndApplyFocus'
      ).and.callThrough();

      // The focus message shouldn't register when the popover is closed.
      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Close);
      detectChangesFakeAsync();
      fixture.componentInstance.sendMessage(SkyPopoverMessageType.Focus);
      detectChangesFakeAsync();
      expect(applyFocusSpy).not.toHaveBeenCalled();
    }));

    it('should allow repositioning the popover', fakeAsync(inject(
      [SkyAffixService], (affixService: SkyAffixService) => {

        const mockAffixer = {
          offsetChange: new Subject(),
          overflowScroll: new Subject(),
          placementChange: new Subject(),
          affixTo() {},
          destroy() {},
          reaffix() {}
        };

        spyOn(affixService, 'createAffixer').and.returnValue(mockAffixer);

        fixture.componentInstance.placement = 'below';
        detectChangesFakeAsync();

        const popover = getPopoverElement();
        const affixSpy = spyOn(mockAffixer, 'reaffix').and.callThrough();

        fixture.componentInstance.sendMessage(SkyPopoverMessageType.Reposition);
        detectChangesFakeAsync();

        // Repositioning should only happen if popover is open.
        expect(affixSpy).not.toHaveBeenCalled();

        // Open the popover.
        fixture.componentInstance.sendMessage(SkyPopoverMessageType.Open);
        detectChangesFakeAsync();

        // Trigger a temporary placement change.
        mockAffixer.placementChange.next({
          placement: 'above'
        });

        detectChangesFakeAsync();

        // Confirm that the new temporary placement was recognized.
        expect(popover).toHaveCssClass('sky-popover-placement-above');

        affixSpy.calls.reset();

        // Make a call to reposition the popover.
        fixture.componentInstance.sendMessage(SkyPopoverMessageType.Reposition);
        detectChangesFakeAsync();

        // The original, preferred placement should be re-applied.
        expect(affixSpy).toHaveBeenCalled();
        expect(popover).toHaveCssClass('sky-popover-placement-below');
      }
    )));
  });

  describe('fullscreen mode', function () {
    it('should display popovers as fullscreen', fakeAsync(() => {
      fixture.componentInstance.placement = 'fullscreen';
      detectChangesFakeAsync();

      const button = getCallerElement();
      const popover = getPopoverElement();

      button.click();
      detectChangesFakeAsync();

      expect(popover).toHaveCssClass('sky-popover-placement-fullscreen');
    }));

    // it('should display popovers as fullscreen if the popover is larger than its parent on resize',
    //   fakeAsync(inject(
    //     [SkyPopoverAdapterService],
    //     (adapterService: SkyPopoverAdapterService) => {
    //       spyOn(adapterService, 'isPopoverLargerThanWindow').and.returnValue(true);

    //       fixture.componentInstance.allowFullscreen = true;
    //       fixture.componentInstance.placement = 'below';
    //       detectChangesFakeAsync();

    //       const button = getCallerElement();
    //       const popover = getPopoverElement();

    //       button.click();
    //       detectChangesFakeAsync();

    //       expect(popover).toHaveCssClass('sky-popover-placement-below');

    //       SkyAppTestUtility.fireDomEvent(window, 'resize');
    //       detectChangesFakeAsync();

    //       expect(fixture.componentInstance.popoverRef.placement).toEqual('fullscreen');
    //     }
    //   ))
    // );

  });

  describe('affixer events', function () {
    let mockAffixer: any;
    let affixService: SkyAffixService;

    beforeEach(inject(
      [SkyAffixService],
      (_affixService: SkyAffixService) => {
        affixService = _affixService;
        mockAffixer = {
          offsetChange: new Subject(),
          overflowScroll: new Subject(),
          placementChange: new Subject(),
          affixTo() {},
          destroy() {}
        };

        spyOn(affixService, 'createAffixer').and.returnValue(mockAffixer);
      }
    ));

    it('should find a new placement if the current one is hidden', fakeAsync(() => {
      detectChangesFakeAsync();

      const button = getCallerElement();
      const popover = getPopoverElement();

      button.click();

      detectChangesFakeAsync();

      expect(popover).toHaveCssClass('sky-popover-placement-above');

      mockAffixer.placementChange.next({
        placement: 'below'
      });

      detectChangesFakeAsync();

      expect(popover).toHaveCssClass('sky-popover-placement-below');
    }));

    it('should hide the popover if a valid placement cannot be found', fakeAsync(() => {
      detectChangesFakeAsync();

      const button = getCallerElement();
      const popover = getPopoverElement();

      button.click();

      detectChangesFakeAsync();

      expect(isElementVisible(popover)).toEqual(true);

      // Trigger a null placement change.
      /*tslint:disable:no-null-keyword*/
      mockAffixer.placementChange.next({
        placement: null
      });
      /*tslint:enable:no-null-keyword*/

      detectChangesFakeAsync();

      expect(fixture.componentInstance.popoverRef.isVisible).toEqual(false);
    }));

    it('should display popovers as fullscreen if the popover is larger than its parent',
      fakeAsync(inject(
        [SkyPopoverAdapterService],
        (adapterService: SkyPopoverAdapterService) => {
          spyOn(adapterService, 'isPopoverLargerThanWindow').and.returnValue(true);

          fixture.componentInstance.placement = 'below';
          detectChangesFakeAsync();

          const button = getCallerElement();
          const popover = getPopoverElement();

          button.click();
          // Trigger a null placement change.
          /*tslint:disable:no-null-keyword*/
          mockAffixer.placementChange.next({
            placement: null
          });
          /*tslint:enable:no-null-keyword*/
          detectChangesFakeAsync();

          expect(popover).toHaveCssClass('sky-popover-placement-fullscreen');
        }
      ))
    );

    it('should update popover arrow on scroll', fakeAsync(() => {
      detectChangesFakeAsync();

      const button = getCallerElement();

      const arrowSpy = spyOn(fixture.componentInstance.popoverRef as any, 'updateArrowOffset')
        .and.callThrough();

      button.click();
      detectChangesFakeAsync();

      mockAffixer.overflowScroll.next();
      detectChangesFakeAsync();

      expect(arrowSpy).toHaveBeenCalled();

    }));
  });

});

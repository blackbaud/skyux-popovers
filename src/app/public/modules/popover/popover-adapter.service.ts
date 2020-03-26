import {
  ElementRef,
  Injectable,
  Renderer2
} from '@angular/core';

import {
  SkyWindowRefService
} from '@skyux/core';

import {
  SkyPopoverAdapterArrowCoordinates,
  SkyPopoverAdapterElements,
  SkyPopoverPlacement
} from './types';

/**
 * @internal
 */
@Injectable()
export class SkyPopoverAdapterService {

  constructor(
    private renderer: Renderer2,
    private windowRef: SkyWindowRefService
  ) { }

  public hidePopover(elem: ElementRef): void {
    this.renderer.addClass(elem.nativeElement, 'sky-popover-hidden');
  }

  public showPopover(elem: ElementRef): void {
    this.renderer.removeClass(elem.nativeElement, 'sky-popover-hidden');
  }

  public isPopoverLargerThanParent(popover: ElementRef): boolean {
    const windowObj = this.windowRef.getWindow();
    const popoverRect = popover.nativeElement.getBoundingClientRect();

    return (
      popoverRect.height >= windowObj.innerHeight ||
      popoverRect.width >= windowObj.innerWidth
    );
  }

  public getArrowCoordinates(
    elements: SkyPopoverAdapterElements,
    placement: SkyPopoverPlacement
  ): SkyPopoverAdapterArrowCoordinates {
    const callerRect = elements.caller.nativeElement.getBoundingClientRect();
    const popoverRect = elements.popover.nativeElement.getBoundingClientRect();
    const arrowRect = elements.popoverArrow.nativeElement.getBoundingClientRect();

    const pixelTolerance = 20;

    let top: number;
    let left: number;

    if (placement === 'above' || placement === 'below') {
      left = callerRect.left + (callerRect.width / 2);

      // Make sure the arrow never detaches from the popover.
      if (left - pixelTolerance < popoverRect.left) {
        left = popoverRect.left + pixelTolerance;
      } else if (left + pixelTolerance > popoverRect.right) {
        left = popoverRect.right - pixelTolerance;
      }

      if (placement === 'above') {
        top = callerRect.top - arrowRect.height;
      } else {
        top = callerRect.bottom;
      }
    } else {
      top = callerRect.top + (callerRect.height / 2);

      // Make sure the arrow never detaches from the popover.
      if (top - pixelTolerance < popoverRect.top) {
        top = popoverRect.top + pixelTolerance;
      } else if (top + pixelTolerance > popoverRect.bottom) {
        top = popoverRect.bottom - pixelTolerance;
      }

      if (placement === 'left') {
        left = callerRect.left - arrowRect.width;
      } else {
        left = callerRect.right;
      }
    }

    return { top, left };
  }
}

import {
  ElementRef,
  Injectable,
  Renderer2
} from '@angular/core';
import { SkyPopoverAdapterArrowCoordinates, SkyPopoverAdapterElements, SkyPopoverAdapterCoordinates, SkyPopoverPlacement } from './types';

@Injectable()
export class SkyPopoverAdapterService {

  constructor(
    private renderer: Renderer2
  ) { }

  public hidePopover(elem: ElementRef): void {
    this.renderer.addClass(elem.nativeElement, 'sky-popover-hidden');
  }

  public showPopover(elem: ElementRef): void {
    this.renderer.removeClass(elem.nativeElement, 'sky-popover-hidden');
  }

  public getArrowCoordinates(
    elements: SkyPopoverAdapterElements,
    // popoverCoords: SkyPopoverAdapterCoordinates,
    placement: SkyPopoverPlacement
  ): SkyPopoverAdapterArrowCoordinates {
    const callerRect = elements.caller.nativeElement.getBoundingClientRect();
    // const popoverRect = elements.popover.nativeElement.getBoundingClientRect();
    const arrowRect = elements.popoverArrow.nativeElement.getBoundingClientRect();

    let top: number;
    let left: number;

    if (placement === 'above' || placement === 'below') {
      left = callerRect.left + (callerRect.width / 2);
      if (placement === 'above') {
        top = callerRect.top - arrowRect.height;
      } else {
        top = callerRect.bottom;
      }
    } else {
      top = callerRect.top + (callerRect.height / 2);
      if (placement === 'left') {
        left = callerRect.left - arrowRect.width;
      } else {
        left = callerRect.right;
      }
    }

    return { top, left };
  }

}

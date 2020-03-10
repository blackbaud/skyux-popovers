import {
  ElementRef,
  Injectable,
  Renderer2,
  RendererFactory2
} from '@angular/core';

/**
 * @internal
 */
@Injectable()
export class SkyDropdownAdapterService {

  private renderer: Renderer2;

  constructor(
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(undefined, undefined);
  }

  public elementHasFocus(elementRef: ElementRef): boolean {
    const focusedEl = document.activeElement;
    const nativeEl = elementRef.nativeElement;

    return nativeEl.contains(focusedEl);
  }

  public hideElement(elem: ElementRef): void {
    this.renderer.addClass(elem.nativeElement, 'hidden');
  }

  public showElement(elem: ElementRef): void {
    this.renderer.removeClass(elem.nativeElement, 'hidden');
  }
}

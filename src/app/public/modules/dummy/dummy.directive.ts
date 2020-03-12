import {
  Directive,
  HostListener,
  Input,
  ElementRef
} from '@angular/core';

import {
  SkyDummyComponent
} from './dummy.component';

@Directive({
  selector: '[skyDummy]'
})
export class SkyDummyDirective {

  @Input()
  public set skyDummy(value: SkyDummyComponent) {
    if (value) {
      this._dummy = value;
    }
  }

  private _dummy: SkyDummyComponent;

  constructor(
    private elementRef: ElementRef
  ) { }

  @HostListener('click')
  public onClick(): void {
    this._dummy.toggleVisibility(this.elementRef);
  }
}

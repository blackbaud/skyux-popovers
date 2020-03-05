import {
  Directive,
  Input
} from '@angular/core';

import {
  SkyPopoverComponent
} from './popover.component';

@Directive({
  selector: '[skyPopover]'
})
export class SkyPopoverDirective {

  @Input()
  public skyPopover: SkyPopoverComponent;

}

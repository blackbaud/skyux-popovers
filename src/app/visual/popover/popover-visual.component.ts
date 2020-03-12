import {
  AfterViewInit,
  Component,
  QueryList,
  ViewChildren
} from '@angular/core';

import {
  SkyPopoverComponent
} from '../../public';

@Component({
  selector: 'popover-visual',
  templateUrl: './popover-visual.component.html',
  styleUrls: ['./popover-visual.component.scss']
})
export class PopoverVisualComponent implements AfterViewInit {

  @ViewChildren(SkyPopoverComponent)
  private popoverComponents: QueryList<SkyPopoverComponent>;

  public ngAfterViewInit(): void {
    // Disable animations for the visual tests.
    setTimeout(() => {
      this.popoverComponents.forEach(c => c.enableAnimations = false);
    });
  }

}

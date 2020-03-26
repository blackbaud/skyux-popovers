import {
  Component, ViewChild, TemplateRef
} from '@angular/core';

import { SkyOverlayService, SkyOverlayInstance } from '@skyux/core';

import { AnimationTestContentComponent } from './animation-test-content.component';

@Component({
  selector: 'animation-test',
  template: `<ng-template #templateRef><ng-content></ng-content></ng-template>`
})
export class AnimationTestComponent {

  @ViewChild('templateRef', { read: TemplateRef })
  private templateRef: TemplateRef<any>;

  private overlay: SkyOverlayInstance;

  private ref: AnimationTestContentComponent;

  constructor(
    private overlayService: SkyOverlayService
  ) { }

  public open(): void {
    if (!this.overlay) {
      this.overlay = this.overlayService.create();
      this.ref = this.overlay.attachComponent(AnimationTestContentComponent);
    }

    this.ref.toggle();
  }

}

import {
  CommonModule
} from '@angular/common';

import {
  NgModule
} from '@angular/core';
import { SkyAffixModule, SkyOverlayModule } from '@skyux/core';
import { SkyDummyComponent } from './dummy.component';
import { SkyDummyDirective } from './dummy.directive';

@NgModule({
  imports: [
    CommonModule,
    SkyAffixModule,
    SkyOverlayModule
  ],
  exports: [
    SkyDummyComponent,
    SkyDummyDirective
  ],
  declarations: [
    SkyDummyComponent,
    SkyDummyDirective
  ]
})
export class SkyDummyModule { }

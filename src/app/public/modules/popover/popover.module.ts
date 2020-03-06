import {
  CommonModule
} from '@angular/common';

import {
  NgModule
} from '@angular/core';

import {
  BrowserAnimationsModule
} from '@angular/platform-browser/animations';

import {
  SkyAffixModule,
  SkyOverlayModule,
  SkyWindowRefService
} from '@skyux/core';

import {
  SkyIconModule
} from '@skyux/indicators';

import {
  SkyPopoversResourcesModule
} from '../shared';

import {
  SkyPopoverComponent
} from './popover.component';

import {
  SkyPopoverDirective
} from './popover.directive';

@NgModule({
  declarations: [
    SkyPopoverComponent,
    SkyPopoverDirective
  ],
  imports: [
    BrowserAnimationsModule,
    CommonModule,
    SkyAffixModule,
    SkyIconModule,
    SkyOverlayModule,
    SkyPopoversResourcesModule
  ],
  exports: [
    SkyPopoverComponent,
    SkyPopoverDirective
  ],
  providers: [
    SkyWindowRefService
  ]
})
export class SkyPopoverModule { }

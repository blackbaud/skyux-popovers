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
  SkyWindowRefService
} from '@skyux/core';

import {
  SkyIconModule
} from '@skyux/indicators';

import {
  SkyPopoversResourcesModule
} from '../shared';

import {
  SkyPopoverAdapterService
} from './popover-adapter.service';

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
    SkyPopoversResourcesModule
  ],
  exports: [
    SkyPopoverComponent,
    SkyPopoverDirective
  ],
  providers: [
    SkyPopoverAdapterService,
    SkyWindowRefService
  ]
})
export class SkyPopoverModule { }

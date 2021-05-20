import {
  CommonModule
} from '@angular/common';

import {
  NgModule
} from '@angular/core';

import {
  SkyAffixModule,
  SkyCoreAdapterModule,
  SkyOverlayModule
} from '@skyux/core';

import {
  SkyIconModule
} from '@skyux/indicators';

import {
  SkyThemeModule,
  SkyThemeService
} from '@skyux/theme';

import {
  SkyPopoversResourcesModule
} from '../shared/popovers-resources.module';

import {
  SkyPopoverAdapterService
} from './popover-adapter.service';

import {
  SkyPopoverContentComponent
} from './popover-content.component';

import {
  SkyPopoverComponent
} from './popover.component';

import {
  SkyPopoverDirective
} from './popover.directive';

@NgModule({
  declarations: [
    SkyPopoverComponent,
    SkyPopoverContentComponent,
    SkyPopoverDirective
  ],
  imports: [
    CommonModule,
    SkyAffixModule,
    SkyCoreAdapterModule,
    SkyIconModule,
    SkyOverlayModule,
    SkyPopoversResourcesModule,
    SkyThemeModule
  ],
  exports: [
    SkyPopoverComponent,
    SkyPopoverContentComponent,
    SkyPopoverDirective
  ],
  entryComponents: [
    SkyPopoverContentComponent
  ],
  providers: [
    SkyPopoverAdapterService,
    SkyThemeService
  ]
})
export class SkyPopoverModule { }

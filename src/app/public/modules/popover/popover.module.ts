import {
  CommonModule
} from '@angular/common';

import {
  NgModule
} from '@angular/core';

import {
  SkyAffixModule,
  SkyOverlayModule
} from '@skyux/core';

import {
  SkyIconModule
} from '@skyux/indicators';

import {
  SkyThemeModule
} from '@skyux/theme';

import {
  SkyPopoversForRootCompatModule
} from '../shared/popovers-for-root-compat.module';

import {
  SkyPopoversResourcesModule
} from '../shared/popovers-resources.module';

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
    SkyIconModule,
    SkyOverlayModule,
    SkyPopoversForRootCompatModule,
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
  ]
})
export class SkyPopoverModule { }

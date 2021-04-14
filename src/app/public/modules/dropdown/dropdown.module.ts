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
  SkyPopoversResourcesModule
} from '../shared/popovers-resources.module';

import {
  SkyDropdownButtonComponent
} from './dropdown-button.component';

import {
  SkyDropdownItemComponent
} from './dropdown-item.component';

import {
  SkyDropdownMenuComponent
} from './dropdown-menu.component';

import {
  SkyDropdownComponent
} from './dropdown.component';
import {SkyThemeModule} from "@skyux/theme";

@NgModule({
  declarations: [
    SkyDropdownButtonComponent,
    SkyDropdownComponent,
    SkyDropdownItemComponent,
    SkyDropdownMenuComponent
  ],
  imports: [
    CommonModule,
    SkyAffixModule,
    SkyIconModule,
    SkyOverlayModule,
    SkyPopoversResourcesModule,
    SkyThemeModule
  ],
  exports: [
    SkyDropdownButtonComponent,
    SkyDropdownComponent,
    SkyDropdownItemComponent,
    SkyDropdownMenuComponent
  ]
})
export class SkyDropdownModule { }

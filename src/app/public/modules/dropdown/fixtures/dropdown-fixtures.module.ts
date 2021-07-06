import {
  CommonModule
} from '@angular/common';

import {
  NgModule
} from '@angular/core';

import {
  SkyPopoversForRootCompatModule
} from '../../shared/popovers-for-root-compat.module';

import {
  SkyDropdownModule
} from '../dropdown.module';

import {
  DropdownFixtureComponent
} from './dropdown.component.fixture';

@NgModule({
  declarations: [
    DropdownFixtureComponent
  ],
  imports: [
    CommonModule,
    SkyPopoversForRootCompatModule,
    SkyDropdownModule
  ],
  exports: [
    DropdownFixtureComponent
  ]
})
export class SkyDropdownFixturesModule { }

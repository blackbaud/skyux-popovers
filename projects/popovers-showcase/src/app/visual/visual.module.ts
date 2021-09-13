import {
  CommonModule
} from '@angular/common';

import {
  NgModule
} from '@angular/core';

import {
  ReactiveFormsModule
} from '@angular/forms';

import {
  RouterModule
} from '@angular/router';

import {
  SkyE2eThemeSelectorModule
} from '@skyux/e2e-client';

import {
  SkyAppLinkModule
} from '@skyux/router';

import {
  SkyDropdownModule,
  SkyPopoverModule
} from 'projects/popovers/src/public-api';

import {
  DropdownVisualComponent
} from './dropdown/dropdown-visual.component';

import {
  PopoverVisualComponent
} from './popover/popover-visual.component';

import {
  VisualComponent
} from './visual.component';

@NgModule({
  declarations: [
    DropdownVisualComponent,
    PopoverVisualComponent,
    VisualComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SkyAppLinkModule,
    SkyDropdownModule,
    SkyE2eThemeSelectorModule,
    SkyPopoverModule
  ]
})
export class VisualModule {}

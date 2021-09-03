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
  SkyCodeModule
} from '@blackbaud/skyux-lib-code-block';

import {
  SkyDocsToolsModule,
  SkyDocsToolsOptions
} from '@skyux/docs-tools';

import {
  SkyAppLinkModule
} from '@skyux/router';

import {
  SkyDropdownModule,
  SkyPopoverModule
} from '../../../../popovers/src/public-api';

import {
  DropdownVisualComponent
} from './dropdown/dropdown-visual.component';

import {
  PopoverVisualComponent
} from './popover/popover-visual.component';
import { VisualComponent } from './visual.component';

@NgModule({
  declarations: [
    DropdownVisualComponent,
    PopoverVisualComponent,
    VisualComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SkyAppLinkModule,
    SkyCodeModule,
    SkyDocsToolsModule,
    SkyDropdownModule,
    SkyPopoverModule
  ]
})
export class VisualModule {}

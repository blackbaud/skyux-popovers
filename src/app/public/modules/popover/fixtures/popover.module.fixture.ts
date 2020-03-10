import {
  CommonModule
} from '@angular/common';

import {
  NgModule
} from '@angular/core';

import {
  SkyPopoverModule
} from '../popover.module';

import {
  PopoverFixtureComponent
} from './popover.component.fixture';

@NgModule({
  imports: [
    CommonModule,
    SkyPopoverModule
  ],
  exports: [
    PopoverFixtureComponent
  ],
  declarations: [
    PopoverFixtureComponent
  ]
})
export class PopoverFixturesModule {}

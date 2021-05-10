import {
  NgModule
} from '@angular/core';

import {
  BrowserAnimationsModule
} from '@angular/platform-browser/animations';

import {
  SkyPopoverLazyCompatModule
} from './popover-lazy-compat.module';
@NgModule({
  imports: [
    BrowserAnimationsModule
  ],
  exports: [
    SkyPopoverLazyCompatModule
  ]
})
export class SkyPopoverModule { }

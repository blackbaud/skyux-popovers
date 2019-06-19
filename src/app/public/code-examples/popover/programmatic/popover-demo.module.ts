import {
  NgModule
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  PopoverDemoComponent
} from './popover-demo.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PopoverDemoComponent
  ],
  exports: [
    PopoverDemoComponent
  ]
})
export class PopoverDemoModule { }

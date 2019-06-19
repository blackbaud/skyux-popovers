import {
  NgModule
} from '@angular/core';

import {
  SkyDropdownModule,
  SkyPopoverModule
} from './public';

@NgModule({
  exports: [
    SkyDropdownModule,
    SkyPopoverModule
  ]
})
export class AppExtrasModule { }

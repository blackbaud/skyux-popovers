import {
  NgModule
} from '@angular/core';

import {
  SkyCoreAdapterModule
} from '@skyux/core';

/**
 * @internal
 * @deprecated This module can be removed after we upgrade SKY UX development dependencies to version 5.
 */
 @NgModule({
  imports: [
    SkyCoreAdapterModule
  ]
})
export class SkyPopoversForRootCompatModule {}

import {
  NgModule
} from '@angular/core';

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
} from './public';
import { AnimationTestComponent } from './visual/popover/animation-test.component';
import { AnimationTestContentComponent } from './visual/popover/animation-test-content.component';

@NgModule({
  exports: [
    SkyAppLinkModule,
    SkyCodeModule,
    SkyDropdownModule,
    SkyPopoverModule,
    SkyDocsToolsModule
  ],
  entryComponents: [
    AnimationTestComponent,
    AnimationTestContentComponent
  ],
  providers: [
    {
      provide: SkyDocsToolsOptions,
      useValue: {
        gitRepoUrl: 'https://github.com/blackbaud/skyux-popovers',
        packageName: '@skyux/popovers'
      }
    }
  ]
})
export class AppExtrasModule { }

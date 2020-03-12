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
  SkyPopoverModule,
  SkyDummyModule
} from './public';

@NgModule({
  exports: [
    SkyAppLinkModule,
    SkyCodeModule,
    SkyDropdownModule,
    SkyPopoverModule,
    SkyDummyModule,
    SkyDocsToolsModule
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

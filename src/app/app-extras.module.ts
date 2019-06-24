import {
  NgModule
} from '@angular/core';

import {
  SkyCodeModule
} from '@blackbaud/skyux-lib-code-block';

import {
  SkyDocsDemoPageModule,
  SkyDocsSourceCodeProvider,
  SkyDocsTypeDefinitionsProvider,
  SkyDocsCodeExamplesModule,
  SkyDocsDemoModule
} from '@skyux/docs-tools';

import {
  SkyAppLinkModule
} from '@skyux/router';

import {
  SkyDropdownModule,
  SkyPopoverModule
} from './public';

import {
  SkyPopoversSourceCodeProvider
} from './public/plugin-resources/popovers-source-code-provider';

import {
  SkyPopoversTypeDefinitionsProvider
} from './public/plugin-resources/popovers-type-definitions-provider';

@NgModule({
  exports: [
    SkyCodeModule,
    SkyDocsDemoModule,
    SkyDocsDemoPageModule,
    SkyDropdownModule,
    SkyPopoverModule,
    SkyAppLinkModule,
    SkyDocsCodeExamplesModule
  ],
  providers: [
    {
      provide: SkyDocsSourceCodeProvider,
      useClass: SkyPopoversSourceCodeProvider
    },
    {
      provide: SkyDocsTypeDefinitionsProvider,
      useClass: SkyPopoversTypeDefinitionsProvider
    }
  ]
})
export class AppExtrasModule { }

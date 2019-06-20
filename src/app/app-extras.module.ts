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

const popovers = require('@skyux/popovers/bundles/bundle.umd');

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
    popovers.SkyDropdownModule,
    popovers.SkyPopoverModule,
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

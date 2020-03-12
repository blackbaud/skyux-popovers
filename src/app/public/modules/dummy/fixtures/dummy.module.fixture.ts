import {
  CommonModule
} from '@angular/common';

import {
  NgModule
} from '@angular/core';

import {
  SkyDummyModule
} from '../dummy.module';

import {
  DummyFixtureComponent
} from './dummy.component.fixture';

@NgModule({
  imports: [
    CommonModule,
    SkyDummyModule
  ],
  exports: [
    DummyFixtureComponent
  ],
  declarations: [
    DummyFixtureComponent
  ]
})
export class DummyFixturesModule { }

import {
  CommonModule
} from '@angular/common';

import {
  NgModule
} from '@angular/core';

import {
  NoopAnimationsModule
} from '@angular/platform-browser/animations';

import {
  VisualModule
} from './visual/visual.module';

import {
  AppRoutingModule
} from './app-routing.module';

import {
  AppComponent
} from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    CommonModule,
    NoopAnimationsModule,
    VisualModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

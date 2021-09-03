import {
  NgModule
} from '@angular/core';

import {
  RouterModule, Routes
} from '@angular/router';

import {
  DropdownVisualComponent
} from './visual/dropdown/dropdown-visual.component';

import {
  PopoverVisualComponent
} from './visual/popover/popover-visual.component';

const routes: Routes = [
  { path: 'visual/dropdown', component: DropdownVisualComponent },
  { path: 'visual/popover', component: PopoverVisualComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

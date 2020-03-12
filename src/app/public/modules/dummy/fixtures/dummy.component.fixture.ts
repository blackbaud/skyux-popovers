import {
  Component, ViewChild
} from '@angular/core';
import { SkyDummyComponent } from '../dummy.component';

@Component({
  selector: 'app-dummy-test',
  template: `
  <div *ngIf="isActive">
    <button class="trigger-btn" type="button" [skyDummy]="dummy">Toggle dummy</button>
    <sky-dummy #dummy>My dummy component.</sky-dummy>
  </div>
  <button type="isActive" (click)="isActive = !isActive">Destroy component</button>
`
})
export class DummyFixtureComponent {
  public isActive: boolean = true;

  @ViewChild('dummy', { read: SkyDummyComponent })
  public dummyRef: SkyDummyComponent;
}

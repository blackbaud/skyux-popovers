import {
  Component
} from '@angular/core';

@Component({
  selector: 'app-dummy-visual',
  template: `
  <div *ngIf="isActive">
    <button type="button" [skyDummy]="dummy">Toggle dummy</button>
    <sky-dummy #dummy>My dummy component.</sky-dummy>
  </div>
  <button type="isActive" (click)="isActive = !isActive">Destroy component</button>
`
})
export class DummyVisualComponent {
  public isActive: boolean = true;
}

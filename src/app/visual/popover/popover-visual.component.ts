import {
  Component, OnInit, ViewChild, AfterViewInit
} from '@angular/core';

import { AnimationTestComponent } from './animation-test.component';

@Component({
  selector: 'popover-visual',
  templateUrl: './popover-visual.component.html',
  styleUrls: ['./popover-visual.component.scss']
})
export class PopoverVisualComponent implements OnInit, AfterViewInit {

  public isOpen = false;

  @ViewChild('componentRef', {read: AnimationTestComponent})
  private componentRef: AnimationTestComponent;

  public ngOnInit(): void {
  }

  public ngAfterViewInit(): void {
  }

  public onClick(): void {
    this.componentRef.open();
    this.isOpen = !this.isOpen;
  }

}

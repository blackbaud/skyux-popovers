import {
  Component,
  ViewChild
} from '@angular/core';

import {
  Subject
} from 'rxjs/Subject';

import {
  SkyPopoverMessage
} from '../types/popover-message';

import {
  SkyPopoverMessageType
} from '../types/popover-message-type';

import {
  SkyPopoverComponent
} from '../popover.component';

@Component({
  selector: 'sky-test-component',
  templateUrl: './popover.component.fixture.html'
})
export class SkyPopoverTestComponent {

  public messageStream = new Subject<SkyPopoverMessage>();
  public asyncPopoverRef: SkyPopoverComponent;

  @ViewChild('asyncPopover')
  public asyncPopover: SkyPopoverComponent;

  @ViewChild('anotherAsyncPopover')
  public anotherAsyncPopover: SkyPopoverComponent;

  public attachAsyncPopover() {
    this.asyncPopoverRef = this.asyncPopover;
  }

  public attachAnotherAsyncPopover() {
    this.asyncPopoverRef = this.anotherAsyncPopover;
  }

  public sendMessage(messageType: SkyPopoverMessageType) {
    this.messageStream.next({ type: messageType });
  }

}

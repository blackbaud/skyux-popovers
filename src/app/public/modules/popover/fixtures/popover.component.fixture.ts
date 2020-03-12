import {
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  Subject
} from 'rxjs/Subject';

import {
  SkyPopoverAlignment
} from '../types/popover-alignment';

import {
  SkyPopoverMessage
} from '../types/popover-message';

import {
  SkyPopoverMessageType
} from '../types/popover-message-type';

import {
  SkyPopoverPlacement
} from '../types/popover-placement';

import {
  SkyPopoverTrigger
} from '../types/popover-trigger';

import {
  SkyPopoverComponent
} from '../popover.component';

import {
  SkyPopoverDirective
} from '../popover.directive';

@Component({
  selector: 'sky-test-component',
  templateUrl: './popover.component.fixture.html'
})
export class PopoverFixtureComponent implements OnInit {

  //#region directive properties

  public alignment: SkyPopoverAlignment;

  public allowFullscreen: boolean;

  public dismissOnBlur: boolean;

  public isStatic: boolean;

  public messageStream = new Subject<SkyPopoverMessage>();

  public placement: SkyPopoverPlacement;

  public popoverAlignment: SkyPopoverAlignment;

  public popoverPlacement: SkyPopoverPlacement;

  public popoverTitle: string;

  public trigger: SkyPopoverTrigger;

  //#endregion directive properties

  @ViewChild('directiveRef', {
    read: ElementRef
  })
  public callerElementRef: ElementRef;

  @ViewChild('directiveRef', {
    read: SkyPopoverDirective
  })
  public directiveRef: SkyPopoverDirective;

  @ViewChild('popoverRef', {
    read: SkyPopoverComponent
  })
  public popoverRef: SkyPopoverComponent;

  public ngOnInit(): void {
    this.popoverRef.enableAnimations = false;
  }

  public onPopoverClosed(): void { }

  public onPopoverOpened(): void { }

  public sendMessage(messageType: SkyPopoverMessageType): void {
    this.messageStream.next({ type: messageType });
  }

}

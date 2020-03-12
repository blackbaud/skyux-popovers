import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit
} from '@angular/core';

import {
  Subject
} from 'rxjs/Subject';

import 'rxjs/add/operator/takeUntil';

import {
  SkyPopoverAlignment
} from './types/popover-alignment';

import {
  SkyPopoverPlacement
} from './types/popover-placement';

import {
  SkyPopoverTrigger
} from './types/popover-trigger';

import {
  SkyPopoverComponent
} from './popover.component';

import {
  SkyPopoverMessage
} from './types/popover-message';

import {
  SkyPopoverMessageType
} from './types/popover-message-type';

@Directive({
  selector: '[skyPopover]'
})
export class SkyPopoverDirective implements OnInit {

  /**
   * References the popover component to display. Add this directive to the trigger element that opens the popover.
   * @required
   */
  @Input()
  public set skyPopover(value: SkyPopoverComponent) {
    if (value) {
      this._popover = value;
    }
  }

  /**
   * Specifies the horizontal alignment of the popover in relation to the trigger element.
   * @default "center"
   */
  @Input()
  public skyPopoverAlignment: SkyPopoverAlignment;

  /**
   * Provides an observable to send commands to the popover that respect the `SkyPopoverMessage` type.
   */
  @Input()
  public skyPopoverMessageStream = new Subject<SkyPopoverMessage>();

  /**
   * Specifies the placement of the popover in relation to the trigger element.
   * @default "above"
   */
  @Input()
  public skyPopoverPlacement: SkyPopoverPlacement;

  /**
   * Specifies the user action that displays the popover.
   */
  @Input()
  public set skyPopoverTrigger(value: SkyPopoverTrigger) {
    this._trigger = value;
  }

  public get skyPopoverTrigger(): SkyPopoverTrigger {
    return this._trigger || 'click';
  }

  private ngUnsubscribe = new Subject<void>();

  private _popover: SkyPopoverComponent;

  private _trigger: SkyPopoverTrigger;

  constructor(
    private elementRef: ElementRef
  ) { }

  public ngOnInit(): void {
    this.skyPopoverMessageStream
      .takeUntil(this.ngUnsubscribe)
      .subscribe(message => this.handleIncomingMessages(message));
  }

  @HostListener('click')
  public onClick(): void {
    this.sendMessage(SkyPopoverMessageType.Toggle);
  }

  private handleIncomingMessages(message: SkyPopoverMessage): void {
    /* tslint:disable-next-line:switch-default */
    switch (message.type) {
      case SkyPopoverMessageType.Open:
        this._popover.open(this.elementRef);
        break;

      case SkyPopoverMessageType.Close:
        this._popover.close();
        break;

      case SkyPopoverMessageType.Toggle:
        this._popover.toggle(this.elementRef);
        break;

      case SkyPopoverMessageType.Reposition:
        this._popover.reposition();
        break;
    }
  }

  private sendMessage(messageType: SkyPopoverMessageType): void {
    this.skyPopoverMessageStream.next({ type: messageType });
  }

}

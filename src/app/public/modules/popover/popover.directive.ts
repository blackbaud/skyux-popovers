import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';

import {
  SkyWindowRefService
} from '@skyux/core';

import {
  Observable
} from 'rxjs/Observable';

import {
  Subject
} from 'rxjs/Subject';

import 'rxjs/add/observable/fromEvent';

import 'rxjs/add/operator/take';

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
export class SkyPopoverDirective implements OnInit, OnChanges {

  /**
   * References the popover component to display. Add this directive to the trigger element that opens the popover.
   * @required
   */
  @Input()
  public set skyPopover(value: SkyPopoverComponent) {
    /* istanbul ignore else */
    if (value) {
      if (value !== this._popover) {
        this._popover = value;
        this.sendMessage(SkyPopoverMessageType.Close);
      }
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
    private elementRef: ElementRef,
    private windowRef: SkyWindowRefService
  ) { }

  public ngOnInit(): void {
    this.skyPopoverMessageStream
      .takeUntil(this.ngUnsubscribe)
      .subscribe(message => this.handleIncomingMessages(message));

    this.addEventListeners();
  }

  public ngOnChanges(changes: SimpleChanges): void {
  }

  public togglePopover(): void {
    if (this._popover.isOpen) {
      this.sendMessage(SkyPopoverMessageType.Close);
    } else {
      this.sendMessage(SkyPopoverMessageType.Open);
    }
  }

  private handleIncomingMessages(message: SkyPopoverMessage): void {
    /* tslint:disable-next-line:switch-default */
    switch (message.type) {
      case SkyPopoverMessageType.Open:
        this._popover.positionNextTo(
          this.elementRef,
          this.skyPopoverPlacement,
          this.skyPopoverAlignment
        );
        break;

      case SkyPopoverMessageType.Close:
        this._popover.close();
        break;

      case SkyPopoverMessageType.Reposition:
        this._popover.reposition();
        break;

      case SkyPopoverMessageType.Focus:
        this._popover.applyFocus();
        break;
    }
  }

  private sendMessage(messageType: SkyPopoverMessageType): void {
    this.skyPopoverMessageStream.next({ type: messageType });
  }

  private closePopoverOrMarkForClose(): void {
    if (this._popover.isMouseEnter) {
      this._popover.markForCloseOnMouseLeave();
    } else {
      this.sendMessage(SkyPopoverMessageType.Close);
    }
  }

  private addEventListeners(): void {
    const hostElement = this.elementRef.nativeElement;

    Observable
      .fromEvent(hostElement, 'keydown')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: KeyboardEvent) => {
        if (!this._popover.isOpen) {
          return;
        }

        const key = event.key.toLowerCase();
        /* istanbul ignore else */
        if (
          (key === 'arrowup' || key === 'up') ||
          (key === 'arrowright' || key === 'right') ||
          (key === 'arrowdown' || key === 'down') ||
          (key === 'arrowleft' || key === 'left')
        ) {
          event.stopPropagation();
          event.preventDefault();
          this.sendMessage(SkyPopoverMessageType.Focus);
        }
      });

    Observable
      .fromEvent(hostElement, 'keyup')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        /* istanbul ignore else */
        if (key === 'escape') {
          event.stopPropagation();
          event.preventDefault();

          if (this._popover.isOpen) {
            this.sendMessage(SkyPopoverMessageType.Close);
          }
        }
      });

    Observable
      .fromEvent(hostElement, 'click')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        this.togglePopover();
      });

    Observable
      .fromEvent(hostElement, 'mouseenter')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this._popover.isMouseEnter = true;
        if (this.skyPopoverTrigger === 'mouseenter') {
          this.sendMessage(SkyPopoverMessageType.Open);
        }
      });

    Observable
      .fromEvent(hostElement, 'mouseleave')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this._popover.isMouseEnter = false;
        if (this.skyPopoverTrigger === 'mouseenter') {
          if (this._popover.isOpen) {
            // Give the popover a chance to set its isMouseEnter flag before checking to see
            // if it should be closed.
            this.windowRef.getWindow().setTimeout(() => {
              this.closePopoverOrMarkForClose();
            });
          } else {
            // If the mouse leaves before the popover is open,
            // wait for the transition to complete before closing it.
            this._popover.popoverOpened.take(1).subscribe(() => {
              this.closePopoverOrMarkForClose();
            });
          }
        }
      });
  }

}

import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';

import {
  SkyAppWindowRef
} from '@skyux/core';

import {
  fromEvent as observableFromEvent,
  Subject
} from 'rxjs';

import {
  take,
  takeUntil
} from 'rxjs/operators';

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
export class SkyPopoverDirective implements OnChanges, OnDestroy {

  /**
   * References the popover component to display. Add this directive to the trigger element that opens the popover.
   * @required
   */
  @Input()
  public skyPopover: SkyPopoverComponent;

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
  public skyPopoverTrigger: SkyPopoverTrigger = 'click';

  private idled = new Subject<boolean>();

  constructor(
    private elementRef: ElementRef,
    private windowRef: SkyAppWindowRef
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {
    /* istanbul ignore else */
    if (changes.skyPopover) {
      this.removeEventListeners();
      if (changes.skyPopover.currentValue !== undefined) {
        this.addEventListeners();
      }
    }
  }

  public ngOnDestroy(): void {
    this.removeEventListeners();
    this.idled.complete();
  }

  public togglePopover(): void {
    if (this.isPopoverOpen()) {
      this.sendMessage(SkyPopoverMessageType.Close);
      return;
    }

    this.sendMessage(SkyPopoverMessageType.Open);
  }

  private positionPopover(): void {
    this.skyPopover.positionNextTo(
      this.elementRef,
      this.skyPopoverPlacement,
      this.skyPopoverAlignment
    );
  }

  private closePopover(): void {
    this.skyPopover.close();
  }

  private closePopoverOrMarkForClose(): void {
    if (this.skyPopover.isMouseEnter) {
      this.skyPopover.markForCloseOnMouseLeave();
    } else {
      this.sendMessage(SkyPopoverMessageType.Close);
    }
  }

  private isPopoverOpen(): boolean {
    return (this.skyPopover && this.skyPopover.isOpen);
  }

  private addEventListeners(): void {
    const element = this.elementRef.nativeElement;

    this.skyPopoverMessageStream
      .pipe(
        takeUntil(this.idled)
      )
      .subscribe(message => {
        this.handleIncomingMessages(message);
      });

    observableFromEvent(element, 'keyup')
      .pipe(
        takeUntil(this.idled)
      )
      .subscribe((event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        if (key === 'escape' && this.isPopoverOpen()) {
          event.stopPropagation();
          event.preventDefault();
          this.sendMessage(SkyPopoverMessageType.Close);
          this.elementRef.nativeElement.focus();
        }
      });

    observableFromEvent(element, 'click')
      .pipe(
        takeUntil(this.idled)
      )
      .subscribe((event: any) => {
        this.togglePopover();
      });

    observableFromEvent(element, 'mouseenter')
      .pipe(
        takeUntil(this.idled)
      )
      .subscribe((event: MouseEvent) => {
        this.skyPopover.isMouseEnter = true;
        if (this.skyPopoverTrigger === 'mouseenter') {
          event.preventDefault();
          this.sendMessage(SkyPopoverMessageType.Open);
        }
      });

    observableFromEvent(element, 'mouseleave')
      .pipe(
        takeUntil(this.idled)
      )
      .subscribe((event: MouseEvent) => {
        this.skyPopover.isMouseEnter = false;

        if (this.skyPopoverTrigger === 'mouseenter') {
          event.preventDefault();

          if (this.isPopoverOpen()) {
            // Give the popover a chance to set its isMouseEnter flag before checking to see
            // if it should be closed.
            this.windowRef.nativeWindow.setTimeout(() => {
              this.closePopoverOrMarkForClose();
            });
          } else {
            // If the mouse leaves before the popover is open,
            // wait for the transition to complete before closing it.
            this.skyPopover.popoverOpened
              .pipe(
                take(1)
              )
              .subscribe(() => {
                this.closePopoverOrMarkForClose();
              });
          }
        }
      });
  }

  private removeEventListeners(): void {
    this.idled.next(true);
    this.idled.unsubscribe();
    this.idled = new Subject<boolean>();
  }

  private handleIncomingMessages(message: SkyPopoverMessage): void {
    /* tslint:disable-next-line:switch-default */
    switch (message.type) {
      case SkyPopoverMessageType.Open:
        this.positionPopover();
        break;

      case SkyPopoverMessageType.Close:
        this.closePopover();
        break;

      case SkyPopoverMessageType.Reposition:
        // Only reposition the popover if it is already open.
        if (this.isPopoverOpen()) {
          this.positionPopover();
        }
        break;
    }
  }

  private sendMessage(messageType: SkyPopoverMessageType): void {
    this.skyPopoverMessageStream.next({ type: messageType });
  }
}

import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';

import {
  SkyOverlayInstance,
  SkyOverlayService
} from '@skyux/core';

import {
  Subject
} from 'rxjs/Subject';

import {
  SkyPopoverAlignment
} from './types/popover-alignment';

import {
  SkyPopoverPlacement
} from './types/popover-placement';

import {
  SkyPopoverContentComponent
} from './popover-content.component';

import {
  SkyPopoverContext
} from './popover-context';

@Component({
  selector: 'sky-popover',
  templateUrl: './popover.component.html'
})
export class SkyPopoverComponent implements OnDestroy {

  /**
   * Specifies the horizontal alignment of the popover in relation to the trigger element.
   * The `skyPopoverAlignment` property on the popover directive overwrites this property.
   * @default "center"
   */
  @Input()
  public set alignment(value: SkyPopoverAlignment) {
    this._alignment = value;
  }

  public get alignment(): SkyPopoverAlignment {
    return this._alignment || 'center';
  }

  /**
   * Indicates if the popover element should render as a full screen modal
   * when the content is too large to fit inside its parent.
   * @internal
   * @deprecated Fullscreen popovers are not an approved SKY UX design pattern. Use the SKY UX
   * modal component instead.
   */
  @Input()
  public set allowFullscreen(value: boolean) {
    this._allowFullscreen = value;
  }

  public get allowFullscreen(): boolean {
    return this._allowFullscreen === undefined ? true : this._allowFullscreen;
  }

  /**
   * Indicates whether to close the popover when it loses focus.
   * To require users to click a trigger button to close the popover, set this input to false.
   * @default true
   */
  @Input()
  public set dismissOnBlur(value: boolean) {
    this._dismissOnBlur = value;
  }

  public get dismissOnBlur(): boolean {
    if (this._dismissOnBlur === undefined) {
      return true;
    }

    return this._dismissOnBlur;
  }

  /**
   * Specifies the placement of the popover in relation to the trigger element.
   * The `skyPopoverPlacement` property on the popover directive overwrites this property.
   * @default "above"
   */
  @Input()
  public set placement(value: SkyPopoverPlacement) {
    this._placement = value;
  }

  public get placement(): SkyPopoverPlacement {
    return this._placement || 'above';
  }

  /**
   * Specifies a title for the popover.
   */
  @Input()
  public popoverTitle: string;

  /**
   * Fires when users close the popover.
   */
  @Output()
  public popoverClosed = new EventEmitter<SkyPopoverComponent>();

  /**
   * Fires when users open the popover.
   */
  @Output()
  public popoverOpened = new EventEmitter<SkyPopoverComponent>();

  public get isOpen(): boolean {
    return !!(this.contentRef && this.contentRef.isOpen);
  }

  /**
   * Used by unit tests to disable animations since the component is injected at the bottom of the
   * document body.
   * @internal
   */
  public enableAnimations: boolean = true;

  public isMouseEnter: boolean = false;

  @ViewChild('templateRef', { read: TemplateRef })
  private templateRef: TemplateRef<any>;

  private contentRef: SkyPopoverContentComponent;

  /**
   * @deprecated The trigger type `mouseenter` will be removed in the next major version.
   */
  private isMarkedForCloseOnMouseLeave: boolean = false;

  private ngUnsubscribe = new Subject<void>();

  private overlay: SkyOverlayInstance;

  private _alignment: SkyPopoverAlignment;

  private _allowFullscreen: boolean;

  private _dismissOnBlur: boolean;

  private _placement: SkyPopoverPlacement;

  constructor(
    private overlayService: SkyOverlayService
  ) { }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.ngUnsubscribe = undefined;

    if (this.overlay) {
      this.overlayService.close(this.overlay);
      this.overlay = undefined;
    }
  }

  /**
   * Positions the popover next to a given caller element.
   * @param caller The element that opened the popover.
   * @param placement The placement of the popover.
   * @param alignment The horizontal alignment of the popover.
   * @internal
   */
  public positionNextTo(
    caller: ElementRef,
    placement?: SkyPopoverPlacement,
    alignment?: SkyPopoverAlignment
  ): void {
    if (!this.overlay) {
      this.setupOverlay();
    }

    this.placement = placement;
    this.alignment = alignment;

    this.contentRef.open(
      caller,
      {
        allowFullscreen: this.allowFullscreen,
        dismissOnBlur: this.dismissOnBlur,
        enableAnimations: this.enableAnimations,
        horizontalAlignment: this.alignment,
        placement: this.placement
      }
    );
  }

  /**
   * Closes the popover.
   * @internal
   */
  public close(): void {
    this.contentRef.close();
  }

  /**
   * Brings focus to the popover element if its open.
   * @internal
   */
  public applyFocus(): void {
    this.contentRef.applyFocus();
  }

  /**
   * Adds a flag to the popover to close when the mouse leaves the popover's bounds.
   * @internal
   * @deprecated The trigger type `mouseenter` will be removed in the next major version.
   */
  public markForCloseOnMouseLeave(): void {
    this.isMarkedForCloseOnMouseLeave = true;
  }

  private setupOverlay(): void {
    const overlay = this.overlayService.create({
      enableScroll: true,
      enablePointerEvents: true
    });

    overlay.backdropClick
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        if (this.dismissOnBlur) {
          this.close();
        }
      });

    const contentRef = overlay.attachComponent(SkyPopoverContentComponent, [{
      provide: SkyPopoverContext,
      useValue: new SkyPopoverContext({
        contentTemplateRef: this.templateRef
      })
    }]);

    contentRef.opened
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.popoverOpened.emit(this);
      });

    contentRef.closed
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.overlayService.close(this.overlay);
        this.overlay = undefined;
        this.popoverClosed.emit(this);
      });

    contentRef.isMouseEnter
      .takeUntil(this.ngUnsubscribe)
      .subscribe((isMouseEnter) => {
        this.isMouseEnter = isMouseEnter;
        if (this.isMarkedForCloseOnMouseLeave) {
          this.isMarkedForCloseOnMouseLeave = false;
          this.close();
        }
      });

    this.overlay = overlay;
    this.contentRef = contentRef;
  }

}

import {
  AnimationEvent
} from '@angular/animations';

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import {
  SkyAffixAutoFitContext,
  SkyAffixConfig,
  SkyAffixer,
  SkyAffixPlacementChange,
  SkyAffixService,
  SkyAppWindowRef,
  SkyCoreAdapterService,
  SkyOverlayInstance,
  SkyOverlayService
} from '@skyux/core';

import {
  Observable
} from 'rxjs/Observable';

import {
  Subject
} from 'rxjs/Subject';

import 'rxjs/add/observable/fromEvent';

import 'rxjs/add/operator/takeUntil';

import {
  SkyPopoverAlignment
} from './types/popover-alignment';

import {
  SkyPopoverPlacement
} from './types/popover-placement';

import {
  SkyPopoverAdapterService
} from './popover-adapter.service';

import {
  skyPopoverAnimation
} from './popover-animation';

import {
  parseAffixHorizontalAlignment,
  parseAffixPlacement
} from './popover-extensions';

@Component({
  selector: 'sky-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  providers: [SkyPopoverAdapterService],
  animations: [skyPopoverAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyPopoverComponent implements OnInit, AfterViewInit, OnDestroy {

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
   * @deprecated Fullscreen popovers have been deprecated and are not an approved SKY UX design
   * pattern. Use the SKY UX modal component instead.
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
   * Indicates if the popover should be injected in-place as a static HTML element. The default
   * value of `false` injects the popover in an overlay with a fixed position. This setting is for
   * internal use only.
   * @internal
   * @deprecated Static popovers will be removed in the next major version release.
   * @default false
   */
  @Input()
  public set isStatic(value: boolean) {
    this._isStatic = value;
  }

  public get isStatic(): boolean {
    return this._isStatic || false;
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

  public animationState: 'hidden' | 'visible' = 'hidden';

  public arrowTop: number;

  public arrowLeft: number;

  public isMouseEnter = false;

  public isOpen = false;

  public isVisible = false;

  @ViewChild('popoverArrow', {
    read: ElementRef
  })
  private popoverArrow: ElementRef;

  @ViewChild('popoverTemplate', {
    read: TemplateRef
  })
  private popoverTemplate: TemplateRef<any>;

  @ViewChild('popoverContainer', {
    read: ElementRef
  })
  private popoverContainer: ElementRef;

  private affixer: SkyAffixer;

  private caller: ElementRef;

  private idled = new Subject<boolean>();

  private isMarkedForCloseOnMouseLeave = false;

  private overlay: SkyOverlayInstance;

  private preferredPlacement: SkyPopoverPlacement;

  private _alignment: SkyPopoverAlignment;

  private _allowFullscreen: boolean;

  private _dismissOnBlur: boolean;

  private _isStatic: boolean;

  private _placement: SkyPopoverPlacement;

  constructor(
    private adapterService: SkyPopoverAdapterService,
    private changeDetector: ChangeDetectorRef,
    private windowRef: SkyAppWindowRef,
    private affixService: SkyAffixService,
    private overlayService: SkyOverlayService,
    private viewContainerRef: ViewContainerRef,
    private coreAdapterService: SkyCoreAdapterService
  ) { }

  public ngOnInit(): void {
    this.preferredPlacement = this.placement;

    if (this.isStatic) {
      this.viewContainerRef.createEmbeddedView(this.popoverTemplate);
      this.animationState = 'visible';
      this.isVisible = true;
      this.changeDetector.markForCheck();
    } else {
      this.overlay = this.createOverlay();
    }
  }

  public ngAfterViewInit(): void {
    if (this.isStatic) {
      this.adapterService.makeStatic(this.popoverContainer);
    } else {
      this.affixer = this.createAffixer();
    }
  }

  public ngOnDestroy(): void {
    if (this.affixer) {
      this.affixer.destroy();
    }

    if (this.overlay) {
      this.overlay.close();
    }

    this.removeListeners();
  }

  /**
   * Positions the popover element next to the caller element.
   * @internal
   */
  public positionNextTo(
    caller: ElementRef,
    placement?: SkyPopoverPlacement,
    alignment?: SkyPopoverAlignment
  ): void {
    this.removeListeners();

    this.placement = placement;
    this.alignment = alignment;
    this.preferredPlacement = this.placement;
    this.isVisible = true;
    this.animationState = 'visible';
    this.changeDetector.markForCheck();

    // Reuse existing infrastructure if caller unchanged.
    if (this.caller === caller) {
      this.addListeners();
      this.reposition();
      return;
    }

    this.caller = caller;

    if (this.placement === 'fullscreen') {
      console.warn([
        'Fullscreen popovers have been deprecated and are not an approved SKY UX design pattern.',
        'Use the SKY UX modal component instead.'
      ].join(' '));
      return;
    }

    this.addListeners();

    // Let the styles render before gauging the dimensions.
    this.windowRef.nativeWindow.setTimeout(() => {
      const config: SkyAffixConfig = {
        placement: parseAffixPlacement(this.placement),
        horizontalAlignment: parseAffixHorizontalAlignment(this.alignment),
        isSticky: true,
        enableAutoFit: true,
        verticalAlignment: 'middle',
        autoFitContext: SkyAffixAutoFitContext.Viewport
      };

      this.affixer.affixTo(this.caller.nativeElement, config);
      this.updateArrowOffset();
    });
  }

  /**
   * Re-runs the positioning calculation.
   * @internal
   */
  public reposition(): void {
    this.placement = this.preferredPlacement;
    this.changeDetector.markForCheck();

    if (this.placement === 'fullscreen') {
      return;
    }

    this.windowRef.nativeWindow.setTimeout(() => {
      this.affixer.reaffix();
      this.updateArrowOffset();
      this.changeDetector.markForCheck();
    });
  }

  /**
   * Closes the popover.
   * @internal
   */
  public close(): void {
    this.animationState = 'hidden';
    this.removeListeners();
    this.changeDetector.markForCheck();
  }

  public onAnimationStart(event: AnimationEvent): void {
    if (event.fromState === 'void') {
      return;
    }

    if (event.toState === 'visible') {
      this.adapterService.showPopover(this.popoverContainer);
    }
  }

  public onAnimationDone(event: AnimationEvent): void {
    if (event.fromState === 'void') {
      return;
    }

    if (event.toState === 'hidden') {
      this.isOpen = false;
      this.adapterService.hidePopover(this.popoverContainer);
      this.popoverClosed.emit(this);
    } else {
      this.isOpen = true;
      this.popoverOpened.emit(this);
    }
  }

  // TODO: This method is no longer used. Remove it when we decide to make breaking changes.
  public markForCloseOnMouseLeave(): void {
    this.isMarkedForCloseOnMouseLeave = true;
  }

  public applyFocus(): void {
    this.coreAdapterService.getFocusableChildrenAndApplyFocus(
      this.popoverContainer,
      '.sky-popover',
      true
    );
  }

  private updateArrowOffset(): void {
    const { top, left } = this.adapterService.getArrowCoordinates(
      {
        caller: this.caller,
        popoverArrow: this.popoverArrow,
        popover: this.popoverContainer
      },
      this.placement
    );

    this.arrowTop = top;
    this.arrowLeft = left;
    this.changeDetector.markForCheck();
  }

  private createOverlay(): SkyOverlayInstance {
    const overlay = this.overlayService.create({
      closeOnNavigation: false,
      showBackdrop: false,
      enableClose: false,
      enableScroll: true
    });

    overlay.attachTemplate(this.popoverTemplate);

    return overlay;
  }

  private createAffixer(): SkyAffixer {
    return this.affixService.createAffixer(this.popoverContainer);
  }

  /**
   * @deprecated The fullscreen feature will be removed in the next major version release.
   */
  private activateFullscreen(): void {
    this.placement = 'fullscreen';
    // Listeners should not be active during fullscreen mode.
    this.removeListeners();
    this.changeDetector.markForCheck();
  }

  private addListeners(): void {
    const windowObj = this.windowRef.nativeWindow;
    const popoverElement = this.popoverContainer.nativeElement;

    this.idled = new Subject<boolean>();

    Observable
      .fromEvent(windowObj, 'resize')
      .takeUntil(this.idled)
      .subscribe(() => {
        if (
          this.isOpen &&
          this.isVisible &&
          this.allowFullscreen
        ) {
          const isLargerThanWindow = this.adapterService.isPopoverLargerThanWindow(
            this.popoverContainer
          );

          if (isLargerThanWindow) {
            this.activateFullscreen();
          }
        }
      });

    Observable
      .fromEvent(windowObj.document, 'focusin')
      .takeUntil(this.idled)
      .subscribe((event: KeyboardEvent) => {
        const targetIsChild = (popoverElement.contains(event.target));
        const targetIsCaller = (this.caller && this.caller.nativeElement === event.target);

        /* istanbul ignore else */
        if (!targetIsChild && !targetIsCaller && this.dismissOnBlur) {
          // The popover is currently being operated by the user, and
          // has just lost keyboard focus. We should close it.
          this.close();
        }
      });

    Observable
      .fromEvent(windowObj.document, 'click')
      .takeUntil(this.idled)
      .subscribe(() => {
        if (!this.isMouseEnter && this.dismissOnBlur) {
          this.close();
        }
      });

    Observable
      .fromEvent(popoverElement, 'mouseenter')
      .takeUntil(this.idled)
      .subscribe(() => {
        this.isMouseEnter = true;
      });

    Observable
      .fromEvent(popoverElement, 'mouseleave')
      .takeUntil(this.idled)
      .subscribe(() => {
        this.isMouseEnter = false;
        if (this.isMarkedForCloseOnMouseLeave) {
          this.close();
          this.isMarkedForCloseOnMouseLeave = false;
        }
      });

    Observable
      .fromEvent(popoverElement, 'keydown')
      .takeUntil(this.idled)
      .subscribe((event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        // Since the popover now lives in an overlay at the bottom of the document body, we need to
        // handle the tab key ourselves. Otherwise, focus would be moved to the browser's
        // search bar.
        if (key === 'tab') {

          const focusableItems = this.coreAdapterService.getFocusableChildren(popoverElement);
          const isFirstItem = (focusableItems[0] === event.target && event.shiftKey);
          const isLastItem = (focusableItems[focusableItems.length - 1] === event.target);

          if (isFirstItem || isLastItem) {
            event.preventDefault();
            event.stopPropagation();

            this.close();
            this.caller.nativeElement.focus();
          }
        }
      });

    Observable
      .fromEvent(popoverElement, 'keyup')
      .takeUntil(this.idled)
      .subscribe((event: KeyboardEvent) => {
        const key = event.key.toLowerCase();

        if (key === 'escape') {
          event.stopPropagation();
          event.preventDefault();
          this.close();

          /* istanbul ignore else */
          if (this.caller) {
            this.caller.nativeElement.focus();
          }
        }
      });

    this.affixer.offsetChange
      .takeUntil(this.idled)
      .subscribe(() => this.updateArrowOffset());

    this.affixer.overflowScroll
      .takeUntil(this.idled)
      .subscribe(() => this.updateArrowOffset());

    this.affixer.placementChange
      .takeUntil(this.idled)
      .subscribe((change: SkyAffixPlacementChange) => {
        if (change.placement === null) {
          if (
            this.allowFullscreen &&
            this.adapterService.isPopoverLargerThanWindow(this.popoverContainer)
          ) {
            this.activateFullscreen();
          } else {
            this.isVisible = false;
          }

          this.changeDetector.markForCheck();
          return;
        }

        this.placement = change.placement;
        this.isVisible = true;
        this.changeDetector.markForCheck();

        this.updateArrowOffset();
      });
  }

  private removeListeners(): void {
    if (this.idled) {
      this.idled.next();
      this.idled.complete();
      this.idled = undefined;
    }
  }
}

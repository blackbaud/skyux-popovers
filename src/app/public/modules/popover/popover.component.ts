import {
  AnimationEvent
} from '@angular/animations';

import {
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
  SkyAffixer,
  SkyAffixService,
  SkyCoreAdapterService,
  SkyOverlayInstance,
  SkyOverlayService,
  SkyWindowRefService
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
  SkyPopoverOpenConfig
} from './types/popover-open-config';

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
  animations: [skyPopoverAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyPopoverComponent implements OnInit, OnDestroy {

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

  public set isOpen(value: boolean) {
    this._isOpen = value;
    this.updateCssClassNames();
    this.changeDetector.markForCheck();
  }

  public get isOpen(): boolean {
    return this._isOpen || false;
  }

  public animationState: 'hidden' | 'visible' = 'hidden';

  public arrowLeft: number;

  public arrowTop: number;

  /**
   * Used by unit tests to disable animations since the component is injected at the bottom of the
   * document body.
   * @internal
   */
  public enableAnimations: boolean = true;

  public cssClassNames: string[] = [];

  public isMouseEnter: boolean = false;

  public isVisible: boolean = false;

  @ViewChild('popoverArrow', {
    read: ElementRef
  })
  public set popoverArrow(value: ElementRef) {
    if (value) {
      this._popoverArrow = value;
      this.changeDetector.markForCheck();
    }
  }

  public get popoverArrow(): ElementRef {
    return this._popoverArrow;
  }

  @ViewChild('popoverContainer', {
    read: ElementRef
  })
  public set popoverContainer(value: ElementRef) {
    if (value) {
      this._popoverContainer = value;
      this.setupAffixer();
      this.addEventListeners();
      this.changeDetector.markForCheck();
    }
  }

  public get popoverContainer(): ElementRef {
    return this._popoverContainer;
  }

  @ViewChild('popoverTemplate', {
    read: TemplateRef
  })
  private popoverTemplate: TemplateRef<any>;

  private affixer: SkyAffixer;

  private caller: ElementRef;

  private isMarkedForCloseOnMouseLeave = false;

  private ngUnsubscribe = new Subject<void>();

  private overlay: SkyOverlayInstance;

  private preferredPlacement: SkyPopoverPlacement;

  private _alignment: SkyPopoverAlignment;

  private _allowFullscreen: boolean;

  private _dismissOnBlur: boolean;

  private _isOpen: boolean;

  private _isStatic: boolean;

  private _placement: SkyPopoverPlacement;

  private _popoverArrow: ElementRef;

  private _popoverContainer: ElementRef;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private affixService: SkyAffixService,
    private windowRef: SkyWindowRefService,
    private coreAdapterService: SkyCoreAdapterService,
    private overlayService: SkyOverlayService,
    private adapterService: SkyPopoverAdapterService,
    private viewContainerRef: ViewContainerRef
  ) { }

  public ngOnInit(): void {
    this.preferredPlacement = this.placement;
    this.changeDetector.markForCheck();

    if (this.isStatic) {
      this.viewContainerRef.createEmbeddedView(this.popoverTemplate);
      this.animationState = 'visible';
      this.isOpen = true;
      return;
    }

    this.windowRef.getWindow().setTimeout(() => {
      this.setupOverlay();
      this.isOpen = false;
    });
  }

  public ngOnDestroy(): void {
    if (this.overlay) {
      this.overlayService.close(this.overlay);
    }

    this.affixer.destroy();

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.ngUnsubscribe = undefined;
  }

  public onAnimationStart(event: AnimationEvent): void {
    if (event.fromState === 'void') {
      return;
    }

    if (event.toState === 'visible') {
      this.isOpen = true;
    }
  }

  public onAnimationDone(event: AnimationEvent): void {
    if (event.fromState === 'void') {
      return;
    }

    if (event.toState === 'hidden') {
      this.isOpen = false;
      this.popoverClosed.emit(this);
    } else {
      this.isOpen = true;
      this.popoverOpened.emit(this);
    }
  }

  /**
   * Opens the popover.
   * @internal
   * @param caller The element that triggered the popover.
   */
  public open(caller: ElementRef, config: SkyPopoverOpenConfig = {}): void {
    if (config.placement) {
      this.placement = config.placement;
      this.preferredPlacement = this.placement;
    }

    this.alignment = config.alignment;
    this.animationState = 'visible';
    this.caller = caller;

    if (this.isOpen) {
      this.updateCssClassNames();
    }

    if (this.placement === 'fullscreen') {
      this.changeDetector.markForCheck();
      return;
    }

    this.affixer.affixTo(this.caller.nativeElement, {
      placement: parseAffixPlacement(this.placement),
      horizontalAlignment: parseAffixHorizontalAlignment(this.alignment),
      isSticky: true,
      enableAutoFit: true,
      verticalAlignment: 'middle',
      autoFitContext: SkyAffixAutoFitContext.OverflowParent
    });

    this.updateArrowOffset();
    this.changeDetector.markForCheck();
  }

  /**
   * Closes the popover.
   * @internal
   */
  public close(): void {
    this.animationState = 'hidden';
    this.changeDetector.markForCheck();
  }

  /**
   * Repositions an open popover.
   * @internal
   */
  public reposition(): void {
    if (this.isOpen) {
      this.placement = this.preferredPlacement;
      this.open(this.caller);
    }
  }

  /**
   * Toggles the popover.
   * @internal
   * @param caller The element that triggered the popover.
   */
  public toggle(caller: ElementRef, config?: SkyPopoverOpenConfig): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(caller, config);
    }
  }

  /**
   * Brings focus to the popover element if its open.
   * @internal
   */
  public applyFocus(): void {
    if (this.isOpen) {
      this.coreAdapterService.getFocusableChildrenAndApplyFocus(
        this.popoverContainer,
        '.sky-popover',
        true
      );
    }
  }

  /**
   * Adds a flag to the popover to close when the mouse leaves the popover's bounds.
   * @internal
   */
  public markForCloseOnMouseLeave(): void {
    this.isMarkedForCloseOnMouseLeave = true;
  }

  private setupOverlay(): void {
    this.overlay = this.overlayService.create({
      closeOnNavigation: false,
      showBackdrop: false,
      enableClose: false,
      enableScroll: true
    });

    this.overlay.attachTemplate(this.popoverTemplate);
  }

  private setupAffixer(): void {
    this.affixer = this.affixService.createAffixer(this.popoverContainer);

    this.affixer.offsetChange
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.updateArrowOffset();
        this.changeDetector.markForCheck();
      });

    this.affixer.overflowScroll
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.updateArrowOffset();
        this.changeDetector.markForCheck();
      });

    this.affixer.placementChange
      .takeUntil(this.ngUnsubscribe)
      .subscribe((change) => {
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

        this.isVisible = true;
        this.placement = change.placement;
        this.updateCssClassNames();
        this.updateArrowOffset();
        this.changeDetector.markForCheck();
      });
  }

  private addEventListeners(): void {
    const windowObj = this.windowRef.getWindow();
    const popoverElement = this._popoverContainer.nativeElement;

    Observable
      .fromEvent(windowObj, 'resize')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        /*istanbul ignore else*/
        if (
          this.isOpen &&
          this.allowFullscreen
        ) {
          const isLargerThanWindow = this.adapterService.isPopoverLargerThanWindow(
            this.popoverContainer
          );

          /*istanbul ignore else*/
          if (isLargerThanWindow) {
            this.activateFullscreen();
          }
        }
      });

    Observable
      .fromEvent(windowObj.document, 'focusin')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: KeyboardEvent) => {
        /*istanbul ignore if*/
        if (!this.isOpen) {
          return;
        }

        const targetIsChild = (popoverElement.contains(event.target));
        const targetIsCaller = (this.caller && this.caller.nativeElement === event.target);

        /* istanbul ignore else */
        if (!targetIsChild && !targetIsCaller && this.dismissOnBlur) {
          // The popover is currently being operated by the user, and
          // has just lost keyboard focus. We should close it.
          console.log('close focusin');
          this.close();
        }
      });

    Observable
      .fromEvent(windowObj.document, 'click')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        if (!this.isMouseEnter && this.dismissOnBlur) {
          this.close();
        }
      });

    Observable
      .fromEvent(popoverElement, 'mouseenter')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.isMouseEnter = true;
      });

    Observable
      .fromEvent(popoverElement, 'mouseleave')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.isMouseEnter = false;
        /*istanbul ignore else*/
        if (this.isMarkedForCloseOnMouseLeave) {
          this.close();
          this.isMarkedForCloseOnMouseLeave = false;
        }
      });

    Observable
      .fromEvent(popoverElement, 'keydown')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        // Since the popover now lives in an overlay at the bottom of the document body, we need to
        // handle the tab key ourselves. Otherwise, focus would be moved to the browser's
        // search bar.
        /*istanbul ignore else*/
        if (key === 'tab') {
          const focusableItems = this.coreAdapterService.getFocusableChildren(popoverElement);
          const isFirstItem = (focusableItems[0] === event.target && event.shiftKey);
          const isLastItem = (focusableItems[focusableItems.length - 1] === event.target);

          /*istanbul ignore else*/
          if (focusableItems.length === 0 || isFirstItem || isLastItem) {
            event.preventDefault();
            event.stopPropagation();

            this.close();
            this.caller.nativeElement.focus();
          }
        }
      });

    Observable
      .fromEvent(popoverElement, 'keyup')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: KeyboardEvent) => {
        const key = event.key.toLowerCase();

        /*istanbul ignore else*/
        if (key === 'escape' && this.isOpen) {
          event.stopPropagation();
          event.preventDefault();
          this.close();
          this.caller.nativeElement.focus();
        }
      });
  }

  private updateCssClassNames(): void {
    this.cssClassNames = [
      `sky-popover-alignment-${this.alignment}`,
      `sky-popover-placement-${this.placement}`
    ];

    if (!this.isOpen) {
      this.cssClassNames.push('sky-popover-hidden');
    }

    if (!this.allowFullscreen) {
      this.cssClassNames.push('sky-popover-max-height');
    }

    if (this.isStatic) {
      this.cssClassNames.push('sky-popover-static');
    }
  }

  private updateArrowOffset(): void {
    const { top, left } = this.adapterService.getArrowCoordinates(
      {
        caller: this.caller,
        popover: this.popoverContainer,
        popoverArrow: this.popoverArrow
      },
      this.placement
    );

    this.arrowTop = top;
    this.arrowLeft = left;
  }

  /**
   * @deprecated The fullscreen feature will be removed in the next major version release.
   */
  private activateFullscreen(): void {
    this.placement = 'fullscreen';
    this.changeDetector.markForCheck();
  }

}

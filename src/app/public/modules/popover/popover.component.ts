import {
  AnimationEvent,
  animate,
  trigger,
  state,
  style,
  transition
} from '@angular/animations';

import {
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

import 'rxjs/add/observable/fromEvent';

import 'rxjs/add/operator/takeUntil';

import {
  Observable
} from 'rxjs/Observable';

import {
  Subject
} from 'rxjs/Subject';

import {
  SkyPopoverAdapterService
} from './popover-adapter.service';

import {
  SkyPopoverAlignment,
  SkyPopoverPlacement
} from './types';

import {
  parseAffixHorizontalAlignment,
  parseAffixPlacement
} from './popover-extensions';

@Component({
  selector: 'sky-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  animations: [
    trigger('popoverState', [
      state('visible', style({ opacity: 1, visibility: 'visible' })),
      state('hidden', style({ opacity: 0 })),
      transition('hidden => visible', animate('150ms')),
      transition('visible => hidden', animate('150ms'))
    ])
  ]
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

  @ViewChild('popoverArrow')
  public popoverArrow: ElementRef;

  @ViewChild('popoverContainer')
  public set popoverContainer(value: ElementRef) {
    if (value) {
      this._popoverContainer = value;
      this.setupAffixer();
      this.addListeners();
    }
  }

  public get popoverContainer(): ElementRef {
    return this._popoverContainer;
  }

  public animationState: 'hidden' | 'visible' = 'hidden';

  public arrowTop: number;

  public arrowLeft: number;

  /**
   * Used by unit tests to disable animations since the component is injected at the bottom of the
   * document body.
   * @internal
   */
  public enableAnimations: boolean = true;

  public isMouseEnter = false;

  public isOpen = false;

  public isVisible = false;

  @ViewChild('popoverTemplate', {
    read: TemplateRef
  })
  private popoverTemplate: TemplateRef<any>;

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

  private _popoverContainer: ElementRef;

  constructor(
    private affixService: SkyAffixService,
    private coreAdapterService: SkyCoreAdapterService,
    private overlayService: SkyOverlayService,
    private viewContainerRef: ViewContainerRef,
    private adapterService: SkyPopoverAdapterService,
    private windowRef: SkyWindowRefService
  ) { }

  public ngOnInit(): void {
    this.preferredPlacement = this.placement;
    this.isOpen = false;

    if (this.isStatic) {
      this.viewContainerRef.createEmbeddedView(this.popoverTemplate);
      this.animationState = 'visible';
      this.isOpen = true;
      return;
    }

    this.windowRef.getWindow().setTimeout(() => {
      this.setupOverlay();
    });
  }

  public ngOnDestroy(): void {
    if (this.overlay) {
      this.overlayService.close(this.overlay);
    }

    this.affixer.destroy();
    this.removeListeners();
  }

  public positionNextTo(
    caller: ElementRef,
    placement?: SkyPopoverPlacement,
    alignment?: SkyPopoverAlignment
  ): void {
    this.close();

    this.caller = caller;
    this.placement = placement;
    this.alignment = alignment;
    this.preferredPlacement = this.placement;

    // Let the styles render before gauging the dimensions.
    this.windowRef.getWindow().setTimeout(() => {
      if (
        this.allowFullscreen &&
        this.adapterService.isPopoverLargerThanParent(this.popoverContainer)
      ) {
        this.placement = 'fullscreen';
      }

      this.isVisible = true;
      this.positionPopover();
      this.animationState = 'visible';
    });
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
   * Closes the popover.
   * @internal
   */
  public close(): void {
    this.animationState = 'hidden';
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
   * Adds a flag to the popover to close when the mouse leaves the popover's bounds.
   * @internal
   */
  public markForCloseOnMouseLeave(): void {
    this.isMarkedForCloseOnMouseLeave = true;
  }

  private positionPopover(): void {
    if (this.placement !== 'fullscreen') {
      this.affixer.affixTo(this.caller.nativeElement, {
        placement: parseAffixPlacement(this.preferredPlacement),
        horizontalAlignment: parseAffixHorizontalAlignment(this.alignment),
        isSticky: true,
        enableAutoFit: true,
        verticalAlignment: 'middle',
        autoFitContext: SkyAffixAutoFitContext.Viewport
      });

      this.updateArrowOffset();
    }
  }

  private addListeners(): void {
    const windowObj = this.windowRef.getWindow();
    const hostElement = this._popoverContainer.nativeElement;

    Observable
      .fromEvent(windowObj.document, 'focusin')
      .takeUntil(this.idled)
      .subscribe((event: KeyboardEvent) => {
        /*istanbul ignore if*/
        if (!this.isOpen) {
          return;
        }

        const targetIsChild = (hostElement.contains(event.target));
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
      .subscribe((event: MouseEvent) => {
        if (!this.isMouseEnter && this.dismissOnBlur) {
          this.close();
        }
      });

    Observable
      .fromEvent(hostElement, 'mouseenter')
      .takeUntil(this.idled)
      .subscribe(() => {
        this.isMouseEnter = true;
      });

    Observable
      .fromEvent(hostElement, 'mouseleave')
      .takeUntil(this.idled)
      .subscribe(() => {
        this.isMouseEnter = false;
        /*istanbul ignore else*/
        if (this.isMarkedForCloseOnMouseLeave) {
          this.close();
          this.isMarkedForCloseOnMouseLeave = false;
        }
      });

    Observable
      .fromEvent(hostElement, 'keyup')
      .takeUntil(this.idled)
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

    Observable
      .fromEvent(hostElement, 'keydown')
      .takeUntil(this.idled)
      .subscribe((event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        // Since the popover now lives in an overlay at the bottom of the document body, we need to
        // handle the tab key ourselves. Otherwise, focus would be moved to the browser's
        // search bar.
        /*istanbul ignore else*/
        if (key === 'tab') {
          const focusableItems = this.coreAdapterService.getFocusableChildren(hostElement);
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
  }

  private removeListeners(): void {
    this.idled.next(true);
    this.idled.complete();
    this.idled = undefined;
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
      .takeUntil(this.idled)
      .subscribe(() => {
        this.updateArrowOffset();
      });

    this.affixer.overflowScroll
      .takeUntil(this.idled)
      .subscribe(() => {
        this.updateArrowOffset();
      });

    this.affixer.placementChange
      .takeUntil(this.idled)
      .subscribe((change) => {
        if (change.placement === null) {
          if (
            this.allowFullscreen &&
            this.adapterService.isPopoverLargerThanParent(this.popoverContainer)
          ) {
            this.activateFullscreen();
          } else {
            this.isVisible = false;
          }
          return;
        }

        this.placement = change.placement;
        this.isVisible = true;
      });
  }

  /**
   * @deprecated The fullscreen feature will be removed in the next major version release.
   */
  private activateFullscreen(): void {
    this.placement = 'fullscreen';
  }
}

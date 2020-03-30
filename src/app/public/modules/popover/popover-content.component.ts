import {
  AnimationEvent
} from '@angular/animations';

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  Optional,
  ViewContainerRef,
  OnInit
} from '@angular/core';

import {
  SkyAffixAutoFitContext,
  SkyAffixer,
  SkyAffixService,
  SkyCoreAdapterService
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
  SkyPopoverAnimationState
} from './popover-animation-state';

import {
  SkyPopoverContext
} from './popover-context';

import {
  parseAffixHorizontalAlignment,
  parseAffixPlacement
} from './popover-extensions';

/**
 * @internal
 */
@Component({
  selector: 'sky-popover-content',
  templateUrl: './popover-content.component.html',
  styleUrls: ['./popover-content.component.scss'],
  animations: [skyPopoverAnimation]
})
export class SkyPopoverContentComponent implements OnInit, OnDestroy {

  public get animationState(): SkyPopoverAnimationState {
    return this.isOpen ? 'open' : 'closed';
  }

  public get closed(): Observable<void> {
    return this._closed.asObservable();
  }

  public get opened(): Observable<void> {
    return this._opened.asObservable();
  }

  public get isMouseEnter(): Observable<boolean> {
    return this._isMouseEnter.asObservable();
  }

  public affixer: SkyAffixer;

  /**
   * @deprecated Fullscreen popovers are not an approved SKY UX design pattern. Use the SKY UX
   * modal component instead.
   */
  public allowFullscreen: boolean = false;

  public arrowLeft: number;

  public arrowTop: number;

  public dismissOnBlur: boolean = true;

  public enableAnimations: boolean = true;

  public horizontalAlignment: SkyPopoverAlignment;

  public isOpen: boolean = false;

  public placement: SkyPopoverPlacement;

  @ViewChild('arrowRef', { read: ElementRef })
  private arrowRef: ElementRef;

  @ViewChild('popoverRef', { read: ElementRef })
  private popoverRef: ElementRef;

  @ViewChild('contentTarget', { read: ViewContainerRef })
  private contentTarget: ViewContainerRef;

  private caller: ElementRef;

  private ngUnsubscribe = new Subject<void>();

  private _closed = new Subject<void>();

  private _isMouseEnter = new Subject<boolean>();

  private _opened = new Subject<void>();

  constructor(
    private changeDetector: ChangeDetectorRef,
    private elementRef: ElementRef,
    private affixService: SkyAffixService,
    private coreAdapterService: SkyCoreAdapterService,
    private adapterService: SkyPopoverAdapterService,
    @Optional() private context: SkyPopoverContext
  ) { }

  public ngOnInit(): void {
    this.contentTarget.createEmbeddedView(this.context.contentTemplateRef);
    this.addEventListeners();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    this._closed.complete();
    this._opened.complete();

    if (this.affixer) {
      this.affixer.destroy();
    }

    this.affixer =
      this.ngUnsubscribe =
      this._closed =
      this._opened = undefined;
  }

  public onAnimationEvent(event: AnimationEvent): void {
    if (event.fromState === 'void') {
      return;
    }

    if (event.phaseName === 'done') {
      if (event.toState === 'open') {
        this._opened.next();
      } else {
        this._closed.next();
      }
    }
  }

  public open(
    caller: ElementRef,
    config: {
      allowFullscreen: boolean;
      dismissOnBlur: boolean;
      enableAnimations: boolean;
      horizontalAlignment: SkyPopoverAlignment;
      placement: SkyPopoverPlacement;
    }
  ): void {
    this.caller = caller;
    this.allowFullscreen = config.allowFullscreen;
    this.enableAnimations = config.enableAnimations;
    this.placement = config.placement;
    this.horizontalAlignment = config.horizontalAlignment;
    this.dismissOnBlur = config.dismissOnBlur;
    this.changeDetector.markForCheck();

    if (
      this.placement === 'fullscreen' &&
      this.allowFullscreen
    ) {
      this.isOpen = true;
      this.changeDetector.markForCheck();
      return;
    }

    setTimeout(() => {
      if (!this.affixer) {
        this.setupAffixer();
      }

      this.affixer.affixTo(this.caller.nativeElement, {
        autoFitContext: SkyAffixAutoFitContext.Viewport,
        enableAutoFit: true,
        horizontalAlignment: parseAffixHorizontalAlignment(this.horizontalAlignment),
        isSticky: true,
        placement: parseAffixPlacement(this.placement),
        verticalAlignment: 'middle'
      });

      this.updateArrowOffset();

      this.isOpen = true;
      this.changeDetector.markForCheck();
    });
  }

  public close(): void {
    this.isOpen = false;
    this.changeDetector.markForCheck();
  }

  public applyFocus(): void {
    if (this.isOpen) {
      this.coreAdapterService.getFocusableChildrenAndApplyFocus(
        this.popoverRef,
        '.sky-popover',
        true
      );
    }
  }

  private setupAffixer(): void {
    const affixer = this.affixService.createAffixer(this.popoverRef);

    affixer.offsetChange
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.updateArrowOffset();
        this.changeDetector.markForCheck();
      });

    affixer.overflowScroll
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.updateArrowOffset();
        this.changeDetector.markForCheck();
      });

    affixer.placementChange
      .takeUntil(this.ngUnsubscribe)
      .subscribe((change) => {
        if (
          change.placement === null &&
          this.allowFullscreen &&
          this.adapterService.isPopoverLargerThanParent(this.popoverRef)
        ) {
          this.activateFullscreen();
        } else {
          this.placement = change.placement;
        }

        this.changeDetector.markForCheck();
      });

    this.affixer = affixer;
  }

  private updateArrowOffset(): void {
    const { top, left } = this.adapterService.getArrowCoordinates(
      {
        caller: this.caller,
        popover: this.popoverRef,
        popoverArrow: this.arrowRef
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
  }

  private addEventListeners(): void {
    const hostElement = this.elementRef.nativeElement;

    Observable
      .fromEvent(hostElement, 'mouseenter')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => this._isMouseEnter.next(true));

    Observable
      .fromEvent(hostElement, 'mouseleave')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => this._isMouseEnter.next(false));

    Observable
      .fromEvent(hostElement, 'keydown')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: KeyboardEvent) => {
        /* istanbul ignore if */
        if (!this.dismissOnBlur) {
          return;
        }

        const key = event.key.toLowerCase();
        // Since the popover now lives in an overlay at the bottom of the document body, we need to
        // handle the tab key ourselves. Otherwise, focus would be moved to the browser's
        // search bar.
        /*istanbul ignore else*/
        if (key === 'tab') {
          const focusableItems = this.coreAdapterService.getFocusableChildren(hostElement);

          const isFirstItem = (
            focusableItems[0] === event.target &&
            event.shiftKey
          );

          const isLastItem = (
            focusableItems[focusableItems.length - 1] === event.target &&
            !event.shiftKey
          );

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
      .fromEvent(hostElement, 'keyup')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: KeyboardEvent) => {
        const key = event.key.toLowerCase();

        /*istanbul ignore else*/
        if (this.isOpen && key === 'escape') {
          event.preventDefault();
          event.stopPropagation();
          this.close();
          this.caller.nativeElement.focus();
        }
      });
  }

}

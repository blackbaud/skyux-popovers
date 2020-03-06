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
  ViewChild
} from '@angular/core';

import {
  SkyAffixConfig,
  SkyAffixer,
  SkyAffixPlacementChange,
  SkyAffixService,
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
  SkyPopoverAlignment,
  SkyPopoverPlacement
} from './types';

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
   */
  @Input()
  public dismissOnBlur = true;

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

  private _placement: SkyPopoverPlacement;

  constructor(
    private adapterService: SkyPopoverAdapterService,
    private changeDetector: ChangeDetectorRef,
    private windowRef: SkyWindowRefService,
    private affixService: SkyAffixService,
    private overlayService: SkyOverlayService
  ) { }

  public ngOnInit(): void {
    this.preferredPlacement = this.placement;
    this.overlay = this.createOverlay();
  }

  public ngAfterViewInit(): void {
    this.affixer = this.createAffixer();
  }

  public ngOnDestroy(): void {
    this.affixer.destroy();
    this.overlay.close();
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

    this.caller = caller;
    this.placement = placement;
    this.alignment = alignment;
    this.preferredPlacement = this.placement;
    this.changeDetector.markForCheck();

    this.addListeners();

    // Let the styles render before gauging the dimensions.
    this.windowRef.getWindow().setTimeout(() => {
      const config: SkyAffixConfig = {
        placement: parseAffixPlacement(placement),
        horizontalAlignment: parseAffixHorizontalAlignment(alignment),
        isSticky: true,
        enableAutoFit: true,
        verticalAlignment: 'middle'
      };

      this.isVisible = true;
      this.affixer.affixTo(caller.nativeElement, config);
      this.animationState = 'visible';
      this.changeDetector.markForCheck();
    });
  }

  /**
   * Re-runs the positioning calculation.
   * @internal
   */
  public reposition(): void {
    this.placement = this.preferredPlacement;
    this.changeDetector.markForCheck();

    this.windowRef.getWindow().setTimeout(() => {
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
  }

  private createOverlay(): SkyOverlayInstance {
    const overlay = this.overlayService.create({
      closeOnNavigation: true,
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

  private addListeners(): void {
    const windowObj = this.windowRef.getWindow();
    const popoverElement = this.popoverContainer.nativeElement;

    this.idled = new Subject<boolean>();

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
      .subscribe((event: MouseEvent) => {
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

    this.affixer.overflowScroll
      .takeUntil(this.idled)
      .subscribe(() => {
        this.updateArrowOffset();
        this.changeDetector.markForCheck();
      });

    this.affixer.placementChange
      .takeUntil(this.idled)
      .subscribe((change: SkyAffixPlacementChange) => {
        if (change.placement === null) {
          if (this.allowFullscreen) {
            this.placement = 'fullscreen';
          } else {
            this.isVisible = false;
            this.changeDetector.markForCheck();
            return;
          }
        } else {
          this.placement = change.placement;
        }

        this.isVisible = true;
        this.changeDetector.markForCheck();

        this.updateArrowOffset();
        this.changeDetector.markForCheck();
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

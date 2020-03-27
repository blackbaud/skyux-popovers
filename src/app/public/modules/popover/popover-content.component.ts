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
  Observable,
  Subject
} from 'rxjs';

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
  parseAffixHorizontalAlignment,
  parseAffixPlacement
} from './popover-extensions';
import { SkyPopoverContext } from './popover-context';

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

  public arrowLeft: number;

  public arrowTop: number;

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
    this.affixer.destroy();

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    this._closed.complete();
    this._opened.complete();

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
    placement: SkyPopoverPlacement,
    alignment: SkyPopoverAlignment
  ): void {
    this.caller = caller;
    this.placement = placement;
    this.horizontalAlignment = alignment;
    this.changeDetector.markForCheck();

    setTimeout(() => {
      if (!this.affixer) {
        this.setupAffixer();
      }

      this.affixer.affixTo(caller.nativeElement, {
        placement: parseAffixPlacement(placement),
        horizontalAlignment: parseAffixHorizontalAlignment(alignment),
        isSticky: true,
        enableAutoFit: true,
        verticalAlignment: 'middle',
        autoFitContext: SkyAffixAutoFitContext.Viewport
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

    affixer.offsetChange.takeUntil(this.ngUnsubscribe).subscribe(() => {
      this.updateArrowOffset();
      this.changeDetector.markForCheck();
    });

    affixer.overflowScroll.takeUntil(this.ngUnsubscribe).subscribe(() => {
      this.updateArrowOffset();
      this.changeDetector.markForCheck();
    });

    affixer.placementChange.takeUntil(this.ngUnsubscribe).subscribe((change) => {
      this.placement = change.placement;
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
  }

}

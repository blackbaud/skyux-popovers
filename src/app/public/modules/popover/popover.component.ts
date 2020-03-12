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
  SkyPopoverAdapterService
} from './popover-adapter.service';

import {
  parseAffixHorizontalAlignment,
  parseAffixPlacement
} from './popover-extensions';

@Component({
  selector: 'sky-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
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

  public arrowLeft: number;

  public arrowTop: number;

  public cssClassNames: string[] = [];

  public isOpen: boolean = false;

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

  private ngUnsubscribe = new Subject<void>();

  private overlay: SkyOverlayInstance;

  private _alignment: SkyPopoverAlignment;

  private _allowFullscreen: boolean;

  private _dismissOnBlur: boolean;

  private _isStatic: boolean;

  private _popoverArrow: ElementRef;

  private _popoverContainer: ElementRef;

  private _placement: SkyPopoverPlacement;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private affixService: SkyAffixService,
    private overlayService: SkyOverlayService,
    private adapterService: SkyPopoverAdapterService
  ) { }

  public ngOnInit(): void {
    this.updateCssClassNames();
    this.changeDetector.markForCheck();

    setTimeout(() => {
      this.overlay = this.overlayService.create();
      this.overlay.attachTemplate(this.popoverTemplate);
      this.changeDetector.markForCheck();
    });
  }

  public ngOnDestroy(): void {
    if (this.affixer) {
      this.affixer.destroy();
    }

    if (this.overlay) {
      this.overlayService.destroy(this.overlay);
    }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.ngUnsubscribe = undefined;
  }

  public toggleVisibility(caller: ElementRef): void {
    this.isOpen = !this.isOpen;

    if (this.caller !== caller) {
      this.caller = caller;
      this.affixer.affixTo(this.caller.nativeElement, {
        placement: parseAffixPlacement(this.placement),
        horizontalAlignment: parseAffixHorizontalAlignment(this.alignment),
        isSticky: true,
        enableAutoFit: true,
        verticalAlignment: 'middle',
        autoFitContext: SkyAffixAutoFitContext.Viewport
      });
    } else {
      this.affixer.reaffix();
    }

    this.updateCssClassNames();
    this.updateArrowOffset();
    this.changeDetector.markForCheck();
  }

  private updateCssClassNames(): void {
    this.cssClassNames = [
      `sky-popover-alignment-${this.alignment}`,
      `sky-popover-placement-${this.placement}`
    ];

    if (!this.isOpen) {
      this.cssClassNames.push('sky-popover-hidden');
    }
  }

  private updateArrowOffset(): void {
    const { top, left } = this.adapterService.getArrowCoordinates({
      caller: this.caller,
      popover: this.popoverContainer,
      popoverArrow: this.popoverArrow
    }, this.placement);

    this.arrowTop = top;
    this.arrowLeft = left;
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
          return;
        }

        this.placement = change.placement;
        this.updateCssClassNames();
        this.updateArrowOffset();
        this.changeDetector.markForCheck();
      });
  }

}

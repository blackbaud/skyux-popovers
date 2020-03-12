import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';

import {
  SkyAffixer,
  SkyAffixService,
  SkyOverlayInstance,
  SkyOverlayService
} from '@skyux/core';

@Component({
  selector: 'sky-dummy',
  templateUrl: './dummy.component.html',
  styleUrls: ['./dummy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyDummyComponent implements OnInit, OnDestroy {

  public isOpen: boolean = false;

  @ViewChild('elementRef', {
    read: ElementRef
  })
  public set elementRef(value: ElementRef) {
    if (value) {
      this._elementRef = value;
      this.affixer = this.affixService.createAffixer(value);
      this.changeDetector.markForCheck();
    }
  }

  public get elementRef(): ElementRef {
    return this._elementRef;
  }

  @ViewChild('templateRef', {
    read: TemplateRef
  })
  private templateRef: TemplateRef<any>;

  private affixer: SkyAffixer;

  private caller: ElementRef;

  private overlay: SkyOverlayInstance;

  private _elementRef: ElementRef;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private affixService: SkyAffixService,
    private overlayService: SkyOverlayService
  ) { }

  public ngOnInit(): void {
    setTimeout(() => {
      this.overlay = this.overlayService.create();
      this.overlay.attachTemplate(this.templateRef);
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
  }

  public toggleVisibility(caller: ElementRef): void {
    this.isOpen = !this.isOpen;

    if (this.caller !== caller) {
      this.caller = caller;
      this.affixer.affixTo(this.caller.nativeElement);
    } else {
      this.affixer.reaffix();
    }

    this.changeDetector.markForCheck();
  }

}

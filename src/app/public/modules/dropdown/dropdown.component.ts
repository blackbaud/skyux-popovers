import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';

import {
  SkyAffixAutoFitContext,
  SkyAffixer,
  SkyAffixService,
  SkyAppWindowRef,
  SkyOverlayInstance,
  SkyOverlayService
} from '@skyux/core';

import {
  Observable
} from 'rxjs/Observable';

import {
  Subject
} from 'rxjs/Subject';

import 'rxjs/add/operator/takeUntil';

import {
  SkyPopoverAlignment
} from '../popover/types/popover-alignment';

import {
  SkyDropdownHorizontalAlignment
} from './types/dropdown-horizontal-alignment';

import {
  SkyDropdownMessage
} from './types/dropdown-message';

import {
  SkyDropdownMessageType
} from './types/dropdown-message-type';

import {
  SkyDropdownTriggerType
} from './types/dropdown-trigger-type';

import {
  SkyDropdownAdapterService
} from './dropdown-adapter.service';

import {
  parseAffixHorizontalAlignment
} from './dropdown-extensions';

@Component({
  selector: 'sky-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyDropdownComponent implements OnInit, OnDestroy {

  /**
   * Specifies the horizontal alignment of the dropdown menu in relation to the dropdown button.
   * Available values are `left`, `right`, and `center`.
   * @default "left"
   * @deprecated Use `horizontalAlignment` instead.
   */
  @Input()
  public set alignment(value: SkyPopoverAlignment) {
    this._alignment = value;
  }

  public get alignment(): SkyPopoverAlignment {
    return this._alignment || 'left';
  }

  /**
   * Specifies a background color for the dropdown button. Available values are `default` and
   * `primary`. These values set the background color from the
   * [secondary and primary button classes](https://developer.blackbaud.com/skyux/components/button) respectively.
   * @default "default"
   */
  @Input()
  public set buttonStyle(value: string) {
    this._buttonStyle = value;
  }

  public get buttonStyle(): string {
    return this._buttonStyle || 'default';
  }

  /**
   * Specifies the type of button to render as the dropdown's trigger element. To display a button
   * with text and a caret, specify `select` and then enter the button text in a
   * `sky-dropdown-button` element. To display a round button with an ellipsis, specify
   * `context-menu`. And to display a button with a [Font Awesome icon](http://fontawesome.io/icons/), specify the icon's class name.
   * For example, to display the `fa-filter` icon, specify `filter`.
   * @default "select"
   */
  @Input()
  public set buttonType(value: string) {
    this._buttonType = value;
  }

  public get buttonType(): string {
    return this._buttonType || 'select';
  }

  /**
   * Indicates whether to disable the dropdown button.
   * @default false
   */
  @Input()
  public set disabled(value: boolean) {
    this._disabled = value;
  }

  public get disabled(): boolean {
    return this._disabled || false;
  }

  /**
   * Indicates whether to close the dropdown when users click away from the menu.
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
   * Specifies the horizontal alignment of the dropdown menu in relation to the dropdown button.
   * @default "left"
   */
  @Input()
  public set horizontalAlignment(value: SkyDropdownHorizontalAlignment) {
    this._horizontalAlignment = value;
  }

  public get horizontalAlignment(): SkyDropdownHorizontalAlignment {
    return this._horizontalAlignment || 'left';
  }

  /**
   * Specifies an accessibility label to provide a text equivalent for screen readers when the
   * dropdown button has no text.
   */
  @Input()
  public label: string;

  /**
   * Provides an observable to send commands to the dropdown. The commands should respect
   * the [[SkyDropdownMessage]] type.
   */

  @Input()
  public messageStream = new Subject<SkyDropdownMessage>();

  /**
   * Specifies a title to display in a tooltip when users hover the mouse over the dropdown button.
   */
  @Input()
  public title: string;

  /**
   * Specifies how users interact with the dropdown button to expose the dropdown menu. We
   * recommend the default `click` value because the `hover` value can pose accessibility issues
   * for users on touch devices such as phones and tablets.
   * @deprecated We recommend against using this property. If you choose to use the deprecated
   * `hover` value anyway, we recommend that you not use it in combination with the `title`
   * property.
   * @default "click"
   */
  @Input()
  public set trigger(value: SkyDropdownTriggerType) {
    this._trigger = value;
  }

  public get trigger(): SkyDropdownTriggerType {
    return this._trigger || 'click';
  }

  /**
   * @internal
   */
  @ViewChild('triggerButton', {
    read: ElementRef
  })
  public triggerButton: ElementRef;

  /**
   * @internal
   * Indicates if the dropdown button element or any of its children have focus.
   * @deprecated This property will be removed in the next major version release.
   */
  public get buttonIsFocused(): boolean {
    return this.adapter.elementHasFocus(this.triggerButton);
  }

  public set isOpen(value: boolean) {
    this._isOpen = value;
  }

  public get isOpen(): boolean {
    return this._isOpen || false;
  }

  /**
   * @internal
   */
  public isMouseEnter: boolean = false;

  public menuId: string;

  /**
   * @internal
   * Indicates if the dropdown button menu or any of its children have focus.
   * @deprecated This property will be removed in the next major version release.
   */
  public get menuIsFocused(): boolean {
    return this.adapter.elementHasFocus(this.menuContainerElementRef);
  }

  @ViewChild('menuContainerElementRef', {
    read: ElementRef
  })
  public set menuContainerElementRef(value: ElementRef) {
    if (value) {
      this._menuContainerElementRef = value;
      this.destroyAffixer();
      this.createAffixer();
      this.changeDetector.markForCheck();
    }
  }

  public get menuContainerElementRef(): ElementRef {
    return this._menuContainerElementRef;
  }

  public isVisible: boolean = false;

  @ViewChild('menuContainerTemplateRef', {
    read: TemplateRef
  })
  private menuContainerTemplateRef: TemplateRef<any>;

  private affixer: SkyAffixer;

  private ngUnsubscribe = new Subject();

  private overlay: SkyOverlayInstance;

  private _alignment: SkyPopoverAlignment;

  private _buttonStyle: string;

  private _buttonType: string;

  private _disabled: boolean;

  private _dismissOnBlur: boolean;

  private _horizontalAlignment: SkyDropdownHorizontalAlignment;

  private _isOpen = false;

  private _menuContainerElementRef: ElementRef;

  private _trigger: SkyDropdownTriggerType;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private affixService: SkyAffixService,
    private windowRef: SkyAppWindowRef,
    private adapter: SkyDropdownAdapterService,
    private overlayService: SkyOverlayService
  ) { }

  public ngOnInit(): void {
    this.addEventListeners();

    this.messageStream
      .takeUntil(this.ngUnsubscribe)
      .subscribe((message: SkyDropdownMessage) => {
        this.handleIncomingMessages(message);
      });
  }

  public ngOnDestroy(): void {
    this.destroyAffixer();
    this.destroyOverlay();

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.ngUnsubscribe = undefined;
  }

  private addEventListeners(): void {
    const buttonElement = this.triggerButton.nativeElement;

    Observable
      .fromEvent(buttonElement, 'click')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        if (this.isOpen) {
          this.sendMessage(SkyDropdownMessageType.Close);
        } else {
          this.sendMessage(SkyDropdownMessageType.Open);
        }
      });

    Observable
      .fromEvent(buttonElement, 'keyup')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        if (this.isOpen && key === 'escape') {
          this.sendMessage(SkyDropdownMessageType.Close);
          this.sendMessage(SkyDropdownMessageType.FocusTriggerButton);
          event.stopPropagation();
          event.preventDefault();
        }
      });

    Observable
      .fromEvent(buttonElement, 'keydown')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: KeyboardEvent) => {
        const key = event.key.toLowerCase();

        /* tslint:disable-next-line:switch-default */
        switch (key) {
          case 'tab':
            if (this.isOpen) {
              this.sendMessage(SkyDropdownMessageType.Close);
            }
            break;
          case 'enter':
            if (!this.isOpen) {
              this.sendMessage(SkyDropdownMessageType.Open);
              this.sendMessage(SkyDropdownMessageType.FocusFirstItem);
            }
            event.stopPropagation();
            event.preventDefault();
            break;

          case 'arrowdown':
          case 'down':
            this.sendMessage(SkyDropdownMessageType.Open);
            this.sendMessage(SkyDropdownMessageType.FocusFirstItem);
            event.preventDefault();
            break;
        }
      });

    Observable
      .fromEvent(buttonElement, 'mouseenter')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.isMouseEnter = true;
        if (this.trigger === 'hover') {
          this.sendMessage(SkyDropdownMessageType.Open);
        }
      });

    Observable
      .fromEvent(buttonElement, 'mouseleave')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.isMouseEnter = false;
        if (this.trigger === 'hover') {
          // Allow the dropdown menu to set isMouseEnter before checking if the close action
          // should be taken.
          this.windowRef.nativeWindow.setTimeout(() => {
            if (!this.isMouseEnter) {
              this.sendMessage(SkyDropdownMessageType.Close);
            }
          });
        }
      });
  }

  private createOverlay(): void {
    if (this.overlay) {
      return;
    }

    const overlay = this.overlayService.create({
      enableScroll: true,
      enablePointerEvents: true
    });

    overlay.attachTemplate(this.menuContainerTemplateRef);

    overlay.backdropClick
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        if (this.dismissOnBlur) {
          this.sendMessage(SkyDropdownMessageType.Close);
        }
      });

    this.overlay = overlay;
  }

  private destroyAffixer(): void {
    /*istanbul ignore else*/
    if (this.affixer) {
      this.affixer.destroy();
      this.affixer = undefined;
    }
  }

  private destroyOverlay(): void {
    /*istanbul ignore else*/
    if (this.overlay) {
      this.overlayService.close(this.overlay);
      this.overlay = undefined;
    }
  }

  private createAffixer(): void {
    const affixer = this.affixService.createAffixer(this.menuContainerElementRef);

    affixer.placementChange
      .takeUntil(this.ngUnsubscribe)
      .subscribe((change) => {
        this.isVisible = (change.placement !== null);
        this.changeDetector.markForCheck();
      });

    this.affixer = affixer;
  }

  private handleIncomingMessages(message: SkyDropdownMessage): void {
    if (!this.disabled) {
      /* tslint:disable-next-line:switch-default */
      switch (message.type) {
        case SkyDropdownMessageType.Open:
          this.isOpen = true;
          this.positionDropdownMenu();
          break;

        case SkyDropdownMessageType.Close:
          this.isOpen = false;
          this.destroyOverlay();
          break;

        case SkyDropdownMessageType.Reposition:
          // Only reposition the dropdown if it is already open.
          /* istanbul ignore else */
          if (this.isOpen) {
            this.affixer.reaffix();
          }
          break;

        case SkyDropdownMessageType.FocusTriggerButton:
          this.triggerButton.nativeElement.focus();
          break;
      }
    }
  }

  private sendMessage(type: SkyDropdownMessageType): void {
    this.messageStream.next({ type });
  }

  private positionDropdownMenu(): void {
    this.isVisible = false;
    this.createOverlay();
    this.changeDetector.markForCheck();

    this.windowRef.nativeWindow.setTimeout(() => {
      this.affixer.affixTo(this.triggerButton.nativeElement, {
        autoFitContext: SkyAffixAutoFitContext.Viewport,
        enableAutoFit: true,
        horizontalAlignment: parseAffixHorizontalAlignment(
          this._alignment || this.horizontalAlignment
        ),
        isSticky: true,
        placement: 'below'
      });

      this.isVisible = true;
      this.changeDetector.markForCheck();
    });
  }

}

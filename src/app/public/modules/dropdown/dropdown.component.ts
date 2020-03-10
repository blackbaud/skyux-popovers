import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild
} from '@angular/core';

import {
  SkyAppWindowRef
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

@Component({
  selector: 'sky-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SkyDropdownAdapterService]
})
export class SkyDropdownComponent implements AfterViewInit, OnDestroy {

  /**
   * Specifies the horizontal alignment of the dropdown menu in relation to the dropdown button.
   * Available values are `left`, `right`, and `center`.
   * @default "left"
   * @deprecated Set the `horizontalAlignment` property on `SkyDropdownMenuComponent` instead.
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
   */
  @Input()
  public disabled = false;

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
   * Indicates if the dropdown button element or any of its children have focus.
   * @deprecated This property will be removed in the next major version release.
   */
  public get buttonIsFocused(): boolean {
    return this.adapter.elementHasFocus(this.triggerButton);
  }

  public get isOpen(): boolean {
    return this._isOpen;
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
    return this.adapter.elementHasFocus(this.dropdownMenuRef);
  }

  @ViewChild('dropdownMenuRef', {
    read: ElementRef
  })
  private dropdownMenuRef: ElementRef;

  @ViewChild('triggerButton', {
    read: ElementRef
  })
  private triggerButton: ElementRef;

  private isKeyboardActive = false;

  private ngUnsubscribe = new Subject();

  private _alignment: SkyPopoverAlignment;

  private _buttonStyle: string;

  private _buttonType: string;

  private _dismissOnBlur: boolean;

  private _isOpen = false;

  private _trigger: SkyDropdownTriggerType;

  constructor(
    private windowRef: SkyAppWindowRef,
    private adapter: SkyDropdownAdapterService
  ) { }

  public ngAfterViewInit(): void {
    this.addEventListeners();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.ngUnsubscribe = undefined;
  }

  /**
   * @internal
   */
  public getButtonElement(): HTMLElement {
    return this.triggerButton.nativeElement;
  }

  private handleIncomingMessages(message: SkyDropdownMessage): void {
    if (!this.disabled) {
      /* tslint:disable-next-line:switch-default */
      switch (message.type) {
        case SkyDropdownMessageType.Open:
          this._isOpen = true;
          break;

        case SkyDropdownMessageType.Close:
          this._isOpen = false;
          if (this.isKeyboardActive) {
            this.windowRef.nativeWindow.setTimeout(() => {
              this.sendMessage(SkyDropdownMessageType.FocusTriggerButton);
            });
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

  private addEventListeners(): void {

    this.messageStream
      .takeUntil(this.ngUnsubscribe)
      .subscribe(message => this.handleIncomingMessages(message));

    const buttonElement = this.triggerButton.nativeElement;

    Observable
      .fromEvent(buttonElement, 'click')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: MouseEvent) => {
        this.isKeyboardActive = false;
        if (this._isOpen) {
          this.sendMessage(SkyDropdownMessageType.Close);
        } else {
          this.sendMessage(SkyDropdownMessageType.Open);
        }
        event.preventDefault();
      });

    Observable
      .fromEvent(buttonElement, 'keyup')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: KeyboardEvent) => {
        this.isKeyboardActive = true;
        const key = event.key.toLowerCase();

        /* tslint:disable-next-line:switch-default */
        switch (key) {
          case 'enter':
            this.sendMessage(SkyDropdownMessageType.Open);
            this.windowRef.nativeWindow.setTimeout(() => {
              this.sendMessage(SkyDropdownMessageType.FocusFirstItem);
            });
            event.stopPropagation();
            event.preventDefault();
            break;

          case 'escape':
            if (this._isOpen) {
              this.sendMessage(SkyDropdownMessageType.Close);
              event.stopPropagation();
              event.preventDefault();
            }
            break;
        }
      });

    Observable
      .fromEvent(buttonElement, 'keydown')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: KeyboardEvent) => {
        this.isKeyboardActive = true;

        const key = event.key.toLowerCase();
        if (key === 'down' || key === 'arrowdown') {
          this.sendMessage(SkyDropdownMessageType.Open);
          this.windowRef.nativeWindow.setTimeout(() => {
            this.sendMessage(SkyDropdownMessageType.FocusFirstItem);
          });
          event.preventDefault();
        }
      });

    Observable
      .fromEvent(buttonElement, 'mouseenter')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        if (this.trigger === 'hover') {
          this.isMouseEnter = true;
          this.sendMessage(SkyDropdownMessageType.Open);
        }
      });

    Observable
      .fromEvent(buttonElement, 'mouseleave')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        if (this.trigger === 'hover') {
          this.isMouseEnter = false;
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

}

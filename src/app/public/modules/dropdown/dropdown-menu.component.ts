import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
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
  SkyDropdownComponent
} from './dropdown.component';

import {
  SkyDropdownItemComponent
} from './dropdown-item.component';

import {
  SkyDropdownHorizontalAlignment
} from './types/dropdown-horizontal-alignment';

import {
  SkyDropdownMenuChange
} from './types/dropdown-menu-change';

import {
  SkyDropdownMessage
} from './types/dropdown-message';

import {
  SkyDropdownMessageType
} from './types/dropdown-message-type';

let nextId = 0;

@Component({
  selector: 'sky-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyDropdownMenuComponent implements OnInit, AfterViewInit, OnDestroy {

  /**
   * Sets the dropdown menu's `aria-labelledby` attribute to support accessibility. The value should
   * be the HTML element ID (without the leading `#`) of the element that labels the dropdown menu.
   */
  @Input()
  public ariaLabelledBy: string;

  /**
   * Specifies an ARIA role for the dropdown menu to support accessibility by indicating how the
   * dropdown menu functions and what it controls. The ARIA role indicates what the dropdown menu
   * represents on the web page. For information about ARIA roles, see the
   * [WAI-ARIA roles model](https://www.w3.org/WAI/PF/aria/roles).
   * @default "menu"
   */
  @Input()
  public set ariaRole(value: string) {
    this._ariaRole = value;
  }

  public get ariaRole(): string {
    return this._ariaRole || 'menu';
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
   * Indicates whether to use the browser's native focus function when users navigate through menu
   * items with the keyboard. To disable the native focus function, set this property to `false`.
   * For example, to let users interact with the dropdown menu but keep the keyboard focus on a
   * different element, set this property to `false`.
   * @default true
   */
  @Input()
  public set useNativeFocus(value: boolean) {
    this._useNativeFocus = value;
  }

  public get useNativeFocus(): boolean {
    if (this._useNativeFocus === undefined) {
      return true;
    }

    return this._useNativeFocus;
  }

  /**
   * Fires when the dropdown menu's active index or selected item changes. This event provides an
   * observable to emit changes, and the response is of
   * the [[SkyDropdownMessage]] type.
   */
  @Output()
  public menuChanges = new EventEmitter<SkyDropdownMenuChange>();

  public dropdownMenuId: string = `sky-dropdown-menu-${++nextId}`;

  public set menuIndex(value: number) {
    if (value < 0) {
      value = this.menuItems.length - 1;
    }

    if (value >= this.menuItems.length) {
      value = 0;
    }

    this._menuIndex = value;
  }

  public get menuIndex(): number {
    return this._menuIndex;
  }

  public isOpen: boolean = false;

  @ViewChild('dropdownMenuElementRef', {
    read: ElementRef
  })
  private dropdownMenuElementRef: ElementRef;

  @ViewChild('dropdownMenuTemplateRef', {
    read: TemplateRef
  })
  private dropdownMenuTemplateRef: TemplateRef<any>;

  @ContentChildren(SkyDropdownItemComponent)
  private menuItems: QueryList<SkyDropdownItemComponent>;

  private get hasFocusableItems(): boolean {
    return this.menuItems.some(item => item.isFocusable());
  }

  private affixer: SkyAffixer;

  private idled = new Subject();

  private ngUnsubscribe = new Subject();

  private overlay: SkyOverlayInstance;

  private _ariaRole: string;

  private _horizontalAlignment: SkyDropdownHorizontalAlignment;

  private _menuIndex = 0;

  private _useNativeFocus: boolean;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private affixService: SkyAffixService,
    private windowRef: SkyAppWindowRef,
    private overlayService: SkyOverlayService,
    @Optional() private dropdownComponent: SkyDropdownComponent
  ) { }

  public ngOnInit(): void {
    this.createOverlay();
  }

  public ngAfterViewInit(): void {
    this.dropdownComponent.menuId = this.dropdownMenuId;

    this.windowRef.nativeWindow.setTimeout(() => {
      this.createAffixer();

      this.dropdownComponent.messageStream
        .takeUntil(this.ngUnsubscribe)
        .subscribe((message: SkyDropdownMessage) => {
          this.handleIncomingMessage(message);
        });
    });
  }

  public ngOnDestroy(): void {
    if (this.affixer) {
      this.affixer.destroy();
    }

    if (this.overlay) {
      this.overlay.close();
    }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

    this.removeEventListeners();

    this.affixer =
      this.ngUnsubscribe =
      this.overlay = undefined;
  }

  public focusFirstItem(): void {
    if (!this.hasFocusableItems) {
      return;
    }

    this.menuIndex = 0;

    const firstItem = this.getItemByIndex(this.menuIndex);
    if (firstItem && firstItem.isFocusable()) {
      this.focusItem(firstItem);
    } else {
      this.focusNextItem();
    }
  }

  public focusPreviousItem(): void {
    if (!this.hasFocusableItems) {
      return;
    }

    this.menuIndex--;

    const previousItem = this.getItemByIndex(this.menuIndex);
    if (previousItem && previousItem.isFocusable()) {
      this.focusItem(previousItem);
    } else {
      this.focusPreviousItem();
    }
  }

  public focusNextItem() {
    if (!this.hasFocusableItems) {
      return;
    }

    this.menuIndex++;

    const nextItem = this.getItemByIndex(this.menuIndex);
    if (nextItem && nextItem.isFocusable()) {
      this.focusItem(nextItem);
    } else {
      this.focusNextItem();
    }
  }

  public reset(): void {
    this._menuIndex = -1;
    this.resetItemsActiveState();
    this.changeDetector.markForCheck();
  }

  private resetItemsActiveState() {
    this.menuItems.forEach((item: SkyDropdownItemComponent) => {
      item.resetState();
    });
  }

  private focusItem(item: SkyDropdownItemComponent): void {
    this.resetItemsActiveState();
    item.focusElement(this.useNativeFocus);
    this.menuChanges.emit({
      activeIndex: this.menuIndex
    });
  }

  private getItemByIndex(index: number): SkyDropdownItemComponent {
    return this.menuItems.find((item: any, i: number) => {
      return (i === index);
    });
  }

  private handleIncomingMessage(message: SkyDropdownMessage): void {
    /* tslint:disable-next-line:switch-default */
    switch (message.type) {
      case SkyDropdownMessageType.Open:
        this.isOpen = true;
        this.addEventListeners();
        this.reset();
        break;

      case SkyDropdownMessageType.Close:
        this.isOpen = false;
        this.removeEventListeners();
        this.reset();
        break;

      case SkyDropdownMessageType.Reposition:
        // Only reposition the dropdown if it is already open.
        if (this.isOpen) {
          this.affixer.reaffix();
        }
        break;

      case SkyDropdownMessageType.FocusFirstItem:
        this.focusFirstItem();
        break;

      case SkyDropdownMessageType.FocusNextItem:
        this.focusNextItem();
        break;

      case SkyDropdownMessageType.FocusPreviousItem:
        this.focusPreviousItem();
        break;
    }
  }

  private sendMessage(type: SkyDropdownMessageType): void {
    this.dropdownComponent.messageStream.next({ type });
  }

  private createOverlay(): void {
    this.overlay = this.overlayService.create({
      closeOnNavigation: false,
      showBackdrop: false,
      enableClose: false,
      enableScroll: true
    });

    this.overlay.attachTemplate(this.dropdownMenuTemplateRef);
  }

  private createAffixer(): void {
    this.affixer = this.affixService.createAffixer(this.dropdownMenuElementRef);
    this.affixer.affixTo(this.dropdownComponent.getButtonElement(), {
      autoFitContext: SkyAffixAutoFitContext.Viewport,
      enableAutoFit: true,
      horizontalAlignment: this.dropdownComponent.alignment || this.horizontalAlignment,
      isSticky: true,
      placement: 'below'
    });
  }

  private addEventListeners(): void {
    if (this.idled !== undefined) {
      return;
    }

    const windowObj = this.windowRef.nativeWindow;
    const dropdownMenuElement = this.dropdownMenuElementRef.nativeElement;

    this.idled = new Subject();

    Observable
      .fromEvent(windowObj, 'click')
      .takeUntil(this.idled)
      .subscribe((event: MouseEvent) => {
        if (
          this.dropdownComponent.dismissOnBlur &&
          !dropdownMenuElement.contains(event.target) &&
          !this.dropdownComponent.getButtonElement().contains(event.target as Node)
        ) {
          this.sendMessage(SkyDropdownMessageType.Close);
          this.sendMessage(SkyDropdownMessageType.FocusTriggerButton);
        }
      });

    this.menuChanges
      .takeUntil(this.idled)
      .subscribe((change: SkyDropdownMenuChange) => {
        // Close the dropdown when a menu item is selected.
        if (change.selectedItem) {
          this.sendMessage(SkyDropdownMessageType.Close);
        }

        if (change.items) {
          // Update the popover style and position whenever the number of items changes.
          this.sendMessage(SkyDropdownMessageType.Reposition);
        }
      });

    this.menuItems.changes
      .takeUntil(this.idled)
      .subscribe((items: QueryList<SkyDropdownItemComponent>) => {
        this.reset();
        this.menuChanges.emit({
          items: items.toArray()
        });
      });

    Observable
      .fromEvent(dropdownMenuElement, 'click')
      .takeUntil(this.idled)
      .subscribe((event: MouseEvent) => {
        const selectedItem = this.menuItems.find((item: SkyDropdownItemComponent, i: number) => {
          const found = (item.elementRef.nativeElement.contains(event.target));

          if (found) {
            this.menuIndex = i;
            this.menuChanges.next({
              activeIndex: this.menuIndex
            });
          }

          return found;
        });

        /* istanbul ignore else */
        if (selectedItem) {
          this.menuChanges.next({
            selectedItem
          });
        }
      });

    Observable
      .fromEvent(dropdownMenuElement, 'keyup')
      .takeUntil(this.idled)
      .subscribe((event: KeyboardEvent) => {
        const key = event.key.toLowerCase();
        if (key === 'escape') {
          event.stopPropagation();
          event.preventDefault();
          this.sendMessage(SkyDropdownMessageType.Close);
        }
      });

    Observable
      .fromEvent(dropdownMenuElement, 'keydown')
      .takeUntil(this.idled)
      .subscribe((event: KeyboardEvent) => {
        const key = event.key.toLowerCase();

        /*tslint:disable-next-line:switch-default*/
        switch (key) {
          case 'arrowdown':
          case 'down':
            this.focusNextItem();
            event.preventDefault();
            break;

          case 'arrowup':
          case 'up':
            this.focusPreviousItem();
            event.preventDefault();
            break;
        }
      });

    Observable
      .fromEvent(dropdownMenuElement, 'mouseenter')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.dropdownComponent.isMouseEnter = true;
      });

    Observable
      .fromEvent(dropdownMenuElement, 'mouseleave')
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.dropdownComponent.isMouseEnter = false;
        // Allow the dropdown component to set isMouseEnter before checking if the close action
        // should be taken.
        this.windowRef.nativeWindow.setTimeout(() => {
          if (
            this.dropdownComponent.trigger === 'hover' &&
            this.dropdownComponent.isMouseEnter === false
          ) {
            this.sendMessage(SkyDropdownMessageType.Close);
          }
        });
      });
  }

  private removeEventListeners(): void {
    if (this.idled) {
      this.idled.next();
      this.idled.complete();
      this.idled = undefined;
    }
  }
}

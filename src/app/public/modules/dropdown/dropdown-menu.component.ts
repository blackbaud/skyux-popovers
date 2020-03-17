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
  Optional,
  Output,
  QueryList
} from '@angular/core';

import 'rxjs/add/operator/takeUntil';

import {
  SkyCoreAdapterService
} from '@skyux/core';

import {
  Observable
} from 'rxjs/Observable';

import {
  Subject
} from 'rxjs/Subject';

import {
  SkyDropdownComponent
} from './dropdown.component';

import {
  SkyDropdownItemComponent
} from './dropdown-item.component';

import {
  SkyDropdownMenuChange,
  SkyDropdownMessage,
  SkyDropdownMessageType
} from './types';

let nextId = 0;

@Component({
  selector: 'sky-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyDropdownMenuComponent implements AfterViewInit, OnDestroy {

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

  private get hasFocusableItems(): boolean {
    const found = this.menuItems.find(item => item.isFocusable());
    return (found !== undefined);
  }

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

  @ContentChildren(SkyDropdownItemComponent)
  public menuItems: QueryList<SkyDropdownItemComponent>;

  private ngUnsubscribe = new Subject();

  private _ariaRole: string;

  private _menuIndex = 0;

  private _useNativeFocus: boolean;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private elementRef: ElementRef,
    private coreAdapterService: SkyCoreAdapterService,
    @Optional() private dropdownComponent: SkyDropdownComponent
  ) { }

  public ngAfterViewInit(): void {
    /* istanbul ignore else */
    if (this.dropdownComponent) {
      this.dropdownComponent.menuId = this.dropdownMenuId;
      this.dropdownComponent.messageStream
        .takeUntil(this.ngUnsubscribe)
        .subscribe((message: SkyDropdownMessage) => {
          /* tslint:disable-next-line:switch-default */
          switch (message.type) {
            case SkyDropdownMessageType.Open:
            case SkyDropdownMessageType.Close:
            this.reset();
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
        });

      this.menuChanges
        .takeUntil(this.ngUnsubscribe)
        .subscribe((change: SkyDropdownMenuChange) => {
          // Close the dropdown when a menu item is selected.
          if (change.selectedItem) {
            this.dropdownComponent.messageStream.next({
              type: SkyDropdownMessageType.Close
            });
          }

          if (change.items) {
            // Update the popover style and position whenever the number of
            // items changes.
            this.dropdownComponent.messageStream.next({
              type: SkyDropdownMessageType.Reposition
            });
          }
        });
    }

    // Reset dropdown whenever the menu items change.
    this.menuItems.changes
      .takeUntil(this.ngUnsubscribe)
      .subscribe((items: QueryList<SkyDropdownItemComponent>) => {
        this.reset();
        this.menuChanges.emit({
          items: items.toArray()
        });
      });

    this.addEventListeners();
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.ngUnsubscribe = undefined;
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

  private sendMessage(type: SkyDropdownMessageType): void {
    this.dropdownComponent.messageStream.next({ type });
  }

  private addEventListeners(): void {
    const dropdownMenuElement = this.elementRef.nativeElement;

    Observable
      .fromEvent(dropdownMenuElement, 'click')
      .takeUntil(this.ngUnsubscribe)
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
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: KeyboardEvent) => {
        if (!this.dropdownComponent.isOpen) {
          return;
        }

        const key = event.key.toLowerCase();

        /*tslint:disable-next-line:switch-default*/
        switch (key) {
          case 'escape':
            event.stopPropagation();
            event.preventDefault();
            this.sendMessage(SkyDropdownMessageType.Close);
            this.sendMessage(SkyDropdownMessageType.FocusTriggerButton);
            break;
        }
      });

    Observable
      .fromEvent(dropdownMenuElement, 'keydown')
      .takeUntil(this.ngUnsubscribe)
      .subscribe((event: KeyboardEvent) => {
        if (!this.dropdownComponent.isOpen) {
          return;
        }

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

          // Since the menu now lives in an overlay at the bottom of the document body, we need to
          // handle the tab key ourselves. Otherwise, focus would be moved to the browser's
          // search bar.
          case 'tab':
            const focusableItems = this.coreAdapterService.getFocusableChildren(
              dropdownMenuElement
            );

            if (event.shiftKey) {
              const isFirstItem = (focusableItems[0] === event.target);
              if (isFirstItem) {
                this.sendMessage(SkyDropdownMessageType.Close);
                this.sendMessage(SkyDropdownMessageType.FocusTriggerButton);
              } else {
                this.sendMessage(SkyDropdownMessageType.FocusPreviousItem);
              }
            } else {
              const isLastItem = (focusableItems[focusableItems.length - 1] === event.target);
              if (isLastItem) {
                this.sendMessage(SkyDropdownMessageType.Close);
                this.sendMessage(SkyDropdownMessageType.FocusTriggerButton);
              } else {
                this.sendMessage(SkyDropdownMessageType.FocusNextItem);
              }
            }

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
        setTimeout(() => {
          if (
            this.dropdownComponent.trigger === 'hover' &&
            this.dropdownComponent.isMouseEnter === false
          ) {
            this.sendMessage(SkyDropdownMessageType.Close);
          }
        });
      });
  }

}

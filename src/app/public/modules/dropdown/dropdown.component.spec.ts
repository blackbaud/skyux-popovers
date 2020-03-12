import {
  async,
  ComponentFixture,
  fakeAsync,
  inject,
  TestBed,
  tick
} from '@angular/core/testing';

import {
  SkyAffixConfig,
  SkyAffixService
} from '@skyux/core';

import {
  expect,
  SkyAppTestUtility
} from '@skyux-sdk/testing';

import {
  SkyDropdownFixturesModule
} from './fixtures/dropdown-fixtures.module';

import {
  DropdownFixtureComponent
} from './fixtures/dropdown.component.fixture';

import {
  SkyDropdownMessageType
} from './types/dropdown-message-type';

import {
  SkyDropdownItemComponent
} from './dropdown-item.component';

describe('Dropdown component', function () {

  let fixture: ComponentFixture<DropdownFixtureComponent>;

  function getButtonElement(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.sky-dropdown-button');
  }

  function getMenuContainerElement(): HTMLElement {
    return document.querySelector('.sky-dropdown-menu-container');
  }

  function getMenuElement(): Element {
    return getMenuContainerElement().querySelector('.sky-dropdown-menu');
  }

  function getMenuItems(): NodeListOf<Element> {
    return getMenuElement().querySelectorAll('.sky-dropdown-item');
  }

  function getFirstMenuItem(): Element {
    return getMenuItems().item(0);
  }

  function verifyActiveMenuItemByIndex(index: number): void {
    const menuItems = fixture.componentInstance.dropdownItemRefs.toArray();

    menuItems.forEach((item: SkyDropdownItemComponent, i: number) => {
      if (i === index) {
        expect(item.isActive).toEqual(true);
        expect(item.elementRef.nativeElement
          .querySelector('.sky-dropdown-item'))
          .toHaveCssClass('sky-dropdown-item-active');
      } else {
        expect(item.isActive).toEqual(false);
        expect(item.elementRef.nativeElement
          .querySelector('.sky-dropdown-item'))
          .not.toHaveCssClass('sky-dropdown-item-active');
      }
    });
  }

  function isMenuItemFocused(index: number): boolean {
    const menuItemButtons = document.querySelectorAll('.sky-dropdown-item button');
    return isElementFocused(menuItemButtons[index]);
  }

  function isElementFocused(elem: Element): boolean {
    return (elem === document.activeElement);
  }

  function isElementVisible(elem: Element): boolean {
    return (getComputedStyle(elem).visibility !== 'hidden');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SkyDropdownFixturesModule
      ]
    });

    fixture = TestBed.createComponent(DropdownFixtureComponent);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should set defaults', () => {
    fixture.detectChanges();

    const dropdownRef = fixture.componentInstance.dropdownRef;
    expect(dropdownRef.alignment).toEqual('left');
    expect(dropdownRef.buttonStyle).toEqual('default');
    expect(dropdownRef.buttonType).toEqual('select');
    expect(dropdownRef.disabled).toEqual(false);
    expect(dropdownRef.dismissOnBlur).toEqual(true);
    expect(dropdownRef.horizontalAlignment).toEqual('left');
    expect(dropdownRef.label).toBeUndefined();
    expect(dropdownRef.title).toBeUndefined();
    expect(dropdownRef.trigger).toEqual('click');

    const menuRef = fixture.componentInstance.dropdownMenuRef;
    expect(menuRef.ariaLabelledBy).toBeUndefined();
    expect(menuRef.ariaRole).toEqual('menu');
    expect(menuRef.useNativeFocus).toEqual(true);

    const itemRefs = fixture.componentInstance.dropdownItemRefs;
    expect(itemRefs.first.ariaRole).toEqual('menuitem');

    const button = getButtonElement();
    expect(button).toHaveCssClass('sky-btn-default');
  });

  it('should use horizontalAlignment if alignment is undefined', fakeAsync(inject(
    [SkyAffixService],
    (affixService: SkyAffixService) => {
      const expectedAlignment = 'right';

      fixture.componentInstance.alignment = undefined;
      fixture.componentInstance.horizontalAlignment = expectedAlignment;

      let actualConfig: SkyAffixConfig;

      const mockAffixer = {
        affixTo(elem: any, config: SkyAffixConfig ) {
          actualConfig = config;
        },
        destroy() {},
        reaffix() {}
      };

      const createAffixerSpy = spyOn(affixService, 'createAffixer').and.returnValue(mockAffixer);

      fixture.detectChanges();

      // Make sure the set alignment in our test doesn't match the default alignment.
      // (We need to confirm that a change has occurred.)
      expect(fixture.componentInstance.dropdownRef.alignment).not.toEqual(expectedAlignment);

      tick();

      expect(actualConfig.horizontalAlignment).toEqual(expectedAlignment);

      // Clear the spy to return the service to normal.
      createAffixerSpy.and.callThrough();
    }
  )));

  it('should allow setting button style and type', () => {
    fixture.componentInstance.buttonStyle = 'danger';
    fixture.componentInstance.buttonType = 'context-menu';

    fixture.detectChanges();

    const button = getButtonElement();
    expect(button).toHaveCssClass('sky-btn-danger');
    expect(button).toHaveCssClass('sky-dropdown-button-type-context-menu');
  });

  it('should reposition the menu when number of menu items change', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const button = getButtonElement();

    button.click();
    fixture.detectChanges();
    tick();

    expect(fixture.componentInstance.dropdownItemRefs.length).toEqual(4);

    const spy = spyOn(fixture.componentInstance.messageStream, 'next').and.callThrough();
    fixture.componentInstance.changeItems();

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();

    expect(fixture.componentInstance.dropdownItemRefs.length).toEqual(3);
    expect(spy).toHaveBeenCalledWith({
      type: SkyDropdownMessageType.Reposition
    });
  }));

  it('should add scrollbars for long list of dropdown items', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    const button = getButtonElement();

    button.click();
    fixture.detectChanges();
    tick();

    const menu = getMenuElement();

    // Should NOT have a scrollbar.
    expect(menu.scrollHeight > menu.clientHeight).toEqual(false);

    fixture.componentInstance.setManyItems();
    fixture.detectChanges();
    tick();

    // Should now have a scrollbar.
    expect(menu.scrollHeight > menu.clientHeight).toEqual(true);
  }));

  it('should emit when a menu item is selected', fakeAsync(() => {
    const menuChangesSpy = spyOn(fixture.componentInstance, 'onMenuChanges').and.callThrough();
    fixture.detectChanges();
    tick();

    const button = getButtonElement();

    // Open the menu.
    button.click();
    fixture.detectChanges();
    tick();

    // Click third item button.
    const buttonIndex = 2;
    const firstItemButton = getMenuItems().item(buttonIndex).querySelector('button');
    firstItemButton.click();
    fixture.detectChanges();
    tick();

    const selectedItem = fixture.componentInstance.dropdownItemRefs.find((item, i) => {
      return (i === buttonIndex);
    });

    expect(menuChangesSpy).toHaveBeenCalledWith({ activeIndex: buttonIndex });
    expect(menuChangesSpy).toHaveBeenCalledWith({ selectedItem });
  }));

  describe('mouse interactions', function () {
    it('should open and close menu via mouse click', fakeAsync(() => {
      fixture.componentInstance.trigger = 'click';
      fixture.detectChanges();
      tick();

      const button = getButtonElement();

      button.click();
      // Simulate mouse movement as well.
      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');
      fixture.detectChanges();
      tick();

      const dropdownMenu = getMenuElement();
      expect(isElementVisible(dropdownMenu)).toEqual(true);

      button.click();
      // Simulate mouse movement as well.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');
      fixture.detectChanges();
      tick();

      expect(isElementVisible(dropdownMenu)).toEqual(false);
    }));

    it('should open and close menu via mouse hover', fakeAsync(() => {
      fixture.componentInstance.trigger = 'hover';
      fixture.detectChanges();
      tick();

      const button = getButtonElement();
      const container = getMenuContainerElement();
      const menu = getMenuElement();

      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');
      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(true);

      // Simulate moving the mouse to the menu.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');
      SkyAppTestUtility.fireDomEvent(menu, 'mouseenter');
      fixture.detectChanges();
      tick();

      // Confirm menu is still open.
      expect(isElementVisible(container)).toEqual(true);

      // Simulate moving the mouse from the menu to the trigger button.
      SkyAppTestUtility.fireDomEvent(menu, 'mouseleave');
      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');
      fixture.detectChanges();
      tick();

      // Confirm menu is still open.
      expect(isElementVisible(container)).toEqual(true);

      // Simulate mouse leaving the trigger button.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');
      fixture.detectChanges();
      tick();

      // Menu should now be closed.
      expect(isElementVisible(container)).toEqual(false);

      // Re-open the menu.
      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');
      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(true);

      // Simulate moving the mouse to the menu.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');
      SkyAppTestUtility.fireDomEvent(menu, 'mouseenter');
      fixture.detectChanges();
      tick();

      // Confirm menu is still open.
      expect(isElementVisible(container)).toEqual(true);

      // Simulate mouse leaving the menu completely.
      SkyAppTestUtility.fireDomEvent(menu, 'mouseleave');
      fixture.detectChanges();
      tick();

      // Menu should now be closed.
      expect(isElementVisible(container)).toEqual(false);
    }));

    it('should close menu when clicking outside', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const button = getButtonElement();
      const container = getMenuContainerElement();

      button.click();
      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(window.document, 'click');
      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(false);
    }));

    it('should allow preventing menu close on window click', fakeAsync(() => {
      fixture.componentInstance.dismissOnBlur = false;
      fixture.detectChanges();
      tick();

      const button = getButtonElement();
      const container = getMenuContainerElement();

      button.click();
      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(window.document, 'click');
      fixture.detectChanges();
      tick();

      // Menu should still be open.
      expect(isElementVisible(container)).toEqual(true);
    }));
  });

  describe('keyboard interactions', function () {
    it('should open menu with arrowdown key', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const button = getButtonElement();
      const container = getMenuContainerElement();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'arrowdown'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(true);

      // Close the dropdown.
      button.click();
      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(false);

      // IE 11 uses 'down'.
      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'down'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(true);
    }));

    it('should close menu with escape key while trigger button is focused', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const button = getButtonElement();
      const container = getMenuContainerElement();

      button.click();
      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(button, 'keyup', {
        keyboardEventInit: {
          key: 'escape'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(false);
    }));

    it('should close menu with escape key while menu is focused', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const button = getButtonElement();
      const container = getMenuContainerElement();
      const firstItem = getFirstMenuItem();

      button.click();
      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(firstItem, 'keyup', {
        keyboardEventInit: {
          key: 'escape'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(false);
      expect(isElementFocused(button)).toEqual(true);
    }));

    it('should focus first item if opened with enter key', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const button = getButtonElement();
      const container = getMenuContainerElement();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(true);
      expect(isMenuItemFocused(0)).toEqual(true);
    }));

    it('should allow disabling native focus', fakeAsync(() => {
      fixture.componentInstance.useNativeFocus = false;
      fixture.detectChanges();
      tick();

      const button = getButtonElement();
      const container = getMenuContainerElement();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      fixture.detectChanges();
      tick();

      // The menu should be open, but the first item should not be focused.
      expect(isElementVisible(container)).toEqual(true);
      expect(isMenuItemFocused(0)).toEqual(false);
    }));

    it('should not focus the first item if it is disabled', fakeAsync(() => {
      fixture.componentInstance.items[0].disabled = true;
      fixture.detectChanges();
      tick();

      const button = getButtonElement();
      const container = getMenuContainerElement();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(true);
      expect(isMenuItemFocused(0)).toEqual(false);
      expect(isMenuItemFocused(2)).toEqual(true);
    }));

    it('should handle all items being disabled', fakeAsync(() => {
      fixture.componentInstance.items = [
        {
          name: 'Option 1',
          disabled: true
        },
        {
          name: 'Option 2',
          disabled: true
        }
      ];
      fixture.detectChanges();
      tick();

      const button = getButtonElement();
      const menu = getMenuElement();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isMenuItemFocused(0)).toEqual(false);
      expect(isMenuItemFocused(1)).toEqual(false);

      // Attempt to move to next item.
      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'arrowdown'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isMenuItemFocused(0)).toEqual(false);
      expect(isMenuItemFocused(1)).toEqual(false);

      // Attempt to move to previous item.
      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'arrowup'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isMenuItemFocused(0)).toEqual(false);
      expect(isMenuItemFocused(1)).toEqual(false);
    }));

    it('should navigate menu with arrow keys', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const button = getButtonElement();
      const menu = getMenuElement();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isMenuItemFocused(0)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'arrowdown'
        }
      });

      fixture.detectChanges();
      tick();

      // Should skip second item because it is disabled.
      expect(isMenuItemFocused(2)).toEqual(true);

      // Try IE 11 'down' key.
      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'down'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isMenuItemFocused(3)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'arrowdown'
        }
      });

      fixture.detectChanges();
      tick();

      // It should loop back to first item.
      expect(isMenuItemFocused(0)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'arrowup'
        }
      });

      fixture.detectChanges();
      tick();

      // It should loop back to last item.
      expect(isMenuItemFocused(3)).toEqual(true);

      // Try IE 11's 'up' key.
      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'up'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isMenuItemFocused(2)).toEqual(true);
    }));

    it('should close the menu after menu loses focus', fakeAsync(() => {
      fixture.componentInstance.items = [
        {
          name: 'Option 1',
          disabled: false
        },
        {
          name: 'Option 2',
          disabled: false
        }
      ];

      fixture.detectChanges();
      tick();

      const button = getButtonElement();
      const container = getMenuContainerElement();
      const menuItems = getMenuItems();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(true);
      expect(isMenuItemFocused(0)).toEqual(true);

      // Run 'tab'.
      const firstItemButton = menuItems.item(0).querySelector('button');
      SkyAppTestUtility.fireDomEvent(firstItemButton, 'keydown', {
        keyboardEventInit: {
          key: 'tab'
        }
      });

      fixture.detectChanges();
      tick();

      // Tab key should progress to next item.
      expect(isElementVisible(container)).toEqual(true);
      expect(isMenuItemFocused(1)).toEqual(true);

      // Run 'shift+tab'.
      const secondItemButton = menuItems.item(1).querySelector('button');
      SkyAppTestUtility.fireDomEvent(secondItemButton, 'keydown', {
        keyboardEventInit: {
          key: 'tab',
          shiftKey: true
        }
      });

      fixture.detectChanges();
      tick();

      // Tab key should progress to previous item.
      expect(isElementVisible(container)).toEqual(true);
      expect(isMenuItemFocused(0)).toEqual(true);

      // Run 'tab' on last item.
      const lastItemButton = menuItems.item(menuItems.length - 1).querySelector('button');
      SkyAppTestUtility.fireDomEvent(lastItemButton, 'keydown', {
        keyboardEventInit: {
          key: 'tab'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(false);
      expect(isElementFocused(button)).toEqual(true);

      // Re-open menu.
      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(true);

      // Run 'shift+tab' on first item.
      SkyAppTestUtility.fireDomEvent(firstItemButton, 'keydown', {
        keyboardEventInit: {
          key: 'tab',
          shiftKey: true
        }
      });

      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(false);
      expect(isElementFocused(button)).toEqual(true);
    }));

    it('should ignore menu keyboard events if menu is closed', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const menu = getMenuElement();

      // Test menu 'keydown'.
      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'arrowdown'
        }
      });

      fixture.detectChanges();
      tick();

      expect(isMenuItemFocused(0)).toEqual(false);

      const messageSpy = spyOn(fixture.componentInstance.messageStream, 'next').and.callThrough();

      // Test menu 'keyup'.
      SkyAppTestUtility.fireDomEvent(menu, 'keyup', {
        keyboardEventInit: {
          key: 'escape'
        }
      });

      fixture.detectChanges();
      tick();

      expect(messageSpy).not.toHaveBeenCalled();
    }));

    it('should ignore button keyboard events depending on menu visibility', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const button = getButtonElement();

      // Open the menu.
      button.click();
      fixture.detectChanges();
      tick();

      const messageSpy = spyOn(fixture.componentInstance.messageStream, 'next').and.callThrough();

      // Test trigger button 'keydown'.
      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      fixture.detectChanges();
      tick();

      // Enter key should be ignored if menu is open.
      expect(messageSpy).not.toHaveBeenCalledWith({
        type: SkyDropdownMessageType.Open
      });

      // Close the menu.
      button.click();
      fixture.detectChanges();
      tick();

      // Reset spy.
      messageSpy.calls.reset();

      // Test trigger button 'keyup'.
      SkyAppTestUtility.fireDomEvent(button, 'keyup', {
        keyboardEventInit: {
          key: 'escape'
        }
      });

      fixture.detectChanges();
      tick();

      // Escape key should be ignored if menu is closed.
      expect(messageSpy).not.toHaveBeenCalledWith({
        type: SkyDropdownMessageType.Close
      });
    }));
  });

  describe('message stream', function () {
    it('should open and close the menu', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const container = getMenuContainerElement();

      // Verify the menu is closed on startup.
      expect(isElementVisible(container)).toEqual(false);

      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Open);
      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(true);

      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Close);
      fixture.detectChanges();
      tick();

      expect(isElementVisible(container)).toEqual(false);
    }));

    it('should focus the trigger button', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const button = getButtonElement();

      expect(isElementFocused(button)).toEqual(false);

      fixture.componentInstance.sendMessage(SkyDropdownMessageType.FocusTriggerButton);
      fixture.detectChanges();
      tick();

      expect(isElementFocused(button)).toEqual(true);
    }));

    it('should allow navigating the menu', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      // Open the menu.
      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Open);
      fixture.detectChanges();
      tick();

      // Focus the first item.
      fixture.componentInstance.sendMessage(SkyDropdownMessageType.FocusFirstItem);
      fixture.detectChanges();
      tick();

      verifyActiveMenuItemByIndex(0);
      expect(isMenuItemFocused(0)).toEqual(true);

      // Focus the next item.
      fixture.componentInstance.sendMessage(SkyDropdownMessageType.FocusNextItem);
      fixture.detectChanges();
      tick();

      // It should skip the second item because it is disabled.
      verifyActiveMenuItemByIndex(2);
      expect(isMenuItemFocused(2)).toEqual(true);

      // Focus the previous item.
      fixture.componentInstance.sendMessage(SkyDropdownMessageType.FocusPreviousItem);
      fixture.detectChanges();
      tick();

      verifyActiveMenuItemByIndex(0);
      expect(isMenuItemFocused(0)).toEqual(true);
    }));

    it('should not open the menu if disabled', fakeAsync(() => {
      fixture.componentInstance.disabled = true;
      fixture.detectChanges();
      tick();

      // Attempt to open the menu.
      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Open);
      fixture.detectChanges();
      tick();

      const container = getMenuContainerElement();

      expect(isElementVisible(container)).toEqual(false);
    }));

    it('should allow repositioning the menu', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const affixer = fixture.componentInstance.dropdownRef['affixer'];
      const affixSpy = spyOn(affixer, 'reaffix').and.callThrough();

      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Reposition);
      fixture.detectChanges();
      tick();

      // Repositioning should only happen if menu is open.
      expect(affixSpy).not.toHaveBeenCalledWith();
      affixSpy.calls.reset();

      // Open the menu.
      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Open);
      fixture.detectChanges();
      tick();

      // Reposition the menu.
      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Reposition);
      fixture.detectChanges();
      tick();

      // The affixing method should be called now.
      expect(affixSpy).toHaveBeenCalledWith();
    }));
  });

  describe('focus properties', () => {

    it('should reflect the state of focus', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const button = getButtonElement();
      const firstItemButton = getFirstMenuItem().querySelector('button');

      const dropdownRef = fixture.componentInstance.dropdownRef;

      expect(dropdownRef.buttonIsFocused).toEqual(false);
      expect(dropdownRef.menuIsFocused).toEqual(false);

      button.focus();
      fixture.detectChanges();
      tick();

      expect(dropdownRef.buttonIsFocused).toEqual(true);
      expect(dropdownRef.menuIsFocused).toEqual(false);

      // Open the menu.
      button.click();
      fixture.detectChanges();
      tick();

      // Move focus to first item.
      firstItemButton.focus();
      fixture.detectChanges();
      tick();

      expect(dropdownRef.buttonIsFocused).toEqual(false);
      expect(dropdownRef.menuIsFocused).toEqual(true);
    }));
  });

  describe('accessibility', function () {
    it('should set ARIA attributes', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const button = getButtonElement();

      button.click();
      fixture.detectChanges();
      tick();

      const menu = getMenuElement();
      const item = getFirstMenuItem();

      // First, confirm defaults.
      expect(button.getAttribute('aria-label')).toEqual('Context menu');
      expect(menu.getAttribute('role')).toEqual('menu');
      expect(menu.getAttribute('aria-labelledby')).toBeNull();
      expect(item.getAttribute('role')).toEqual('menuitem');

      // Finally, confirm overrides.
      fixture.componentInstance.menuAriaRole = 'menu-role-override';
      fixture.componentInstance.menuAriaLabelledBy = 'menu-labelled-by-override';
      fixture.componentInstance.itemAriaRole = 'item-role-override';
      fixture.componentInstance.label = 'button-label-override';

      fixture.detectChanges();
      tick();

      expect(button.getAttribute('aria-label')).toEqual('button-label-override');
      expect(menu.getAttribute('role')).toEqual('menu-role-override');
      expect(menu.getAttribute('aria-labelledby')).toEqual('menu-labelled-by-override');
      expect(item.getAttribute('role')).toEqual('item-role-override');
    }));

    it('should set the title attribute', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const button = getButtonElement();

      button.click();
      fixture.detectChanges();
      tick();

      expect(button.getAttribute('title')).toBeNull();

      fixture.componentInstance.title = 'dropdown-title-override';
      fixture.detectChanges();
      tick();

      expect(button.getAttribute('title')).toEqual('dropdown-title-override');
    }));

    it('should be accessible', async(() => {
      fixture.detectChanges();

      const button = getButtonElement();

      button.click();
      fixture.detectChanges();

      expect(window.document.body).toBeAccessible();
    }));
  });
});

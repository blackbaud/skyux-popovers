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

  function detectChanges(): void {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();
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

  it('should set defaults', fakeAsync(() => {
    detectChanges();

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
  }));

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
      tick();
      fixture.detectChanges();
      tick();

      // Make sure the set alignment in our test doesn't match the default alignment.
      // (We need to confirm that a change has occurred.)
      expect(fixture.componentInstance.dropdownRef.alignment).not.toEqual(expectedAlignment);

      tick();

      expect(actualConfig.horizontalAlignment).toEqual(expectedAlignment);

      // Clear the spy to return the service to normal.
      createAffixerSpy.and.callThrough();
    }
  )));

  it('should allow setting button style and type', fakeAsync(() => {
    fixture.componentInstance.buttonStyle = 'danger';
    fixture.componentInstance.buttonType = 'context-menu';

    detectChanges();

    const button = getButtonElement();
    expect(button).toHaveCssClass('sky-btn-danger');
    expect(button).toHaveCssClass('sky-dropdown-button-type-context-menu');
  }));

  it('should reposition the menu when number of menu items change', fakeAsync(() => {
    detectChanges();

    const button = getButtonElement();

    button.click();
    detectChanges();

    expect(fixture.componentInstance.dropdownItemRefs.length).toEqual(4);

    const spy = spyOn(fixture.componentInstance.messageStream, 'next').and.callThrough();
    fixture.componentInstance.changeItems();

    detectChanges();

    expect(fixture.componentInstance.dropdownItemRefs.length).toEqual(3);
    expect(spy).toHaveBeenCalledWith({
      type: SkyDropdownMessageType.Reposition
    });
  }));

  it('should add scrollbars for long list of dropdown items', fakeAsync(() => {
    detectChanges();

    const button = getButtonElement();

    button.click();
    detectChanges();

    const menu = getMenuElement();

    // Should NOT have a scrollbar.
    expect(menu.scrollHeight > menu.clientHeight).toEqual(false);

    fixture.componentInstance.setManyItems();
    detectChanges();

    // Should now have a scrollbar.
    expect(menu.scrollHeight > menu.clientHeight).toEqual(true);
  }));

  it('should emit when a menu item is selected', fakeAsync(() => {
    const menuChangesSpy = spyOn(fixture.componentInstance, 'onMenuChanges').and.callThrough();
    detectChanges();

    const button = getButtonElement();

    // Open the menu.
    button.click();
    detectChanges();

    // Click third item button.
    const buttonIndex = 2;
    const firstItemButton = getMenuItems().item(buttonIndex).querySelector('button');
    firstItemButton.click();
    detectChanges();

    const selectedItem = fixture.componentInstance.dropdownItemRefs.find((item, i) => {
      return (i === buttonIndex);
    });

    expect(menuChangesSpy).toHaveBeenCalledWith({ activeIndex: buttonIndex });
    expect(menuChangesSpy).toHaveBeenCalledWith({ selectedItem });
  }));

  describe('mouse interactions', function () {
    it('should open and close menu via mouse click', fakeAsync(() => {
      fixture.componentInstance.trigger = 'click';
      detectChanges();

      const button = getButtonElement();

      button.click();
      // Simulate mouse movement as well.
      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');
      detectChanges();

      const dropdownMenu = getMenuElement();
      expect(isElementVisible(dropdownMenu)).toEqual(true);

      button.click();
      // Simulate mouse movement as well.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');
      detectChanges();

      expect(isElementVisible(dropdownMenu)).toEqual(false);
    }));

    it('should open and close menu via mouse hover', fakeAsync(() => {
      fixture.componentInstance.trigger = 'hover';
      detectChanges();

      const button = getButtonElement();
      const container = getMenuContainerElement();
      const menu = getMenuElement();

      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');
      detectChanges();

      expect(isElementVisible(container)).toEqual(true);

      // Simulate moving the mouse to the menu.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');
      SkyAppTestUtility.fireDomEvent(menu, 'mouseenter');
      detectChanges();

      // Confirm menu is still open.
      expect(isElementVisible(container)).toEqual(true);

      // Simulate moving the mouse from the menu to the trigger button.
      SkyAppTestUtility.fireDomEvent(menu, 'mouseleave');
      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');
      detectChanges();

      // Confirm menu is still open.
      expect(isElementVisible(container)).toEqual(true);

      // Simulate mouse leaving the trigger button.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');
      detectChanges();

      // Menu should now be closed.
      expect(isElementVisible(container)).toEqual(false);

      // Re-open the menu.
      SkyAppTestUtility.fireDomEvent(button, 'mouseenter');
      detectChanges();

      expect(isElementVisible(container)).toEqual(true);

      // Simulate moving the mouse to the menu.
      SkyAppTestUtility.fireDomEvent(button, 'mouseleave');
      SkyAppTestUtility.fireDomEvent(menu, 'mouseenter');
      detectChanges();

      // Confirm menu is still open.
      expect(isElementVisible(container)).toEqual(true);

      // Simulate mouse leaving the menu completely.
      SkyAppTestUtility.fireDomEvent(menu, 'mouseleave');
      detectChanges();

      // Menu should now be closed.
      expect(isElementVisible(container)).toEqual(false);
    }));

    it('should close menu when clicking outside', fakeAsync(() => {
      detectChanges();

      const button = getButtonElement();
      const container = getMenuContainerElement();

      button.click();
      detectChanges();

      expect(isElementVisible(container)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(window.document, 'click');
      detectChanges();

      expect(isElementVisible(container)).toEqual(false);
    }));

    it('should allow preventing menu close on window click', fakeAsync(() => {
      fixture.componentInstance.dismissOnBlur = false;
      detectChanges();

      const button = getButtonElement();
      const container = getMenuContainerElement();

      button.click();
      detectChanges();

      expect(isElementVisible(container)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(window.document, 'click');
      detectChanges();

      // Menu should still be open.
      expect(isElementVisible(container)).toEqual(true);
    }));
  });

  describe('keyboard interactions', function () {
    it('should open menu with arrowdown key', fakeAsync(() => {
      detectChanges();

      const button = getButtonElement();
      const container = getMenuContainerElement();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'arrowdown'
        }
      });

      detectChanges();

      expect(isElementVisible(container)).toEqual(true);

      // Close the dropdown.
      button.click();
      detectChanges();

      expect(isElementVisible(container)).toEqual(false);

      // IE 11 uses 'down'.
      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'down'
        }
      });

      detectChanges();

      expect(isElementVisible(container)).toEqual(true);
    }));

    it('should close menu with escape key while trigger button is focused', fakeAsync(() => {
      detectChanges();

      const button = getButtonElement();
      const container = getMenuContainerElement();

      button.click();
      detectChanges();

      expect(isElementVisible(container)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(button, 'keyup', {
        keyboardEventInit: {
          key: 'escape'
        }
      });

      detectChanges();

      expect(isElementVisible(container)).toEqual(false);
    }));

    it('should close menu with escape key while menu is focused', fakeAsync(() => {
      detectChanges();

      const button = getButtonElement();
      const container = getMenuContainerElement();
      const firstItem = getFirstMenuItem();

      button.click();
      detectChanges();

      expect(isElementVisible(container)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(firstItem, 'keyup', {
        keyboardEventInit: {
          key: 'escape'
        }
      });

      detectChanges();

      expect(isElementVisible(container)).toEqual(false);
      expect(isElementFocused(button)).toEqual(true);
    }));

    it('should focus first item if opened with enter key', fakeAsync(() => {
      detectChanges();

      const button = getButtonElement();
      const container = getMenuContainerElement();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      detectChanges();

      expect(isElementVisible(container)).toEqual(true);
      expect(isMenuItemFocused(0)).toEqual(true);
    }));

    it('should allow disabling native focus', fakeAsync(() => {
      fixture.componentInstance.useNativeFocus = false;
      detectChanges();

      const button = getButtonElement();
      const container = getMenuContainerElement();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      detectChanges();

      // The menu should be open, but the first item should not be focused.
      expect(isElementVisible(container)).toEqual(true);
      expect(isMenuItemFocused(0)).toEqual(false);
    }));

    it('should not focus the first item if it is disabled', fakeAsync(() => {
      fixture.componentInstance.items[0].disabled = true;
      detectChanges();

      const button = getButtonElement();
      const container = getMenuContainerElement();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      detectChanges();

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
      detectChanges();

      const button = getButtonElement();
      const menu = getMenuElement();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      detectChanges();

      expect(isMenuItemFocused(0)).toEqual(false);
      expect(isMenuItemFocused(1)).toEqual(false);

      // Attempt to move to next item.
      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'arrowdown'
        }
      });

      detectChanges();

      expect(isMenuItemFocused(0)).toEqual(false);
      expect(isMenuItemFocused(1)).toEqual(false);

      // Attempt to move to previous item.
      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'arrowup'
        }
      });

      detectChanges();

      expect(isMenuItemFocused(0)).toEqual(false);
      expect(isMenuItemFocused(1)).toEqual(false);
    }));

    it('should navigate menu with arrow keys', fakeAsync(() => {
      detectChanges();

      const button = getButtonElement();
      const menu = getMenuElement();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      detectChanges();

      expect(isMenuItemFocused(0)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'arrowdown'
        }
      });

      detectChanges();

      // Should skip second item because it is disabled.
      expect(isMenuItemFocused(2)).toEqual(true);

      // Try IE 11 'down' key.
      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'down'
        }
      });

      detectChanges();

      expect(isMenuItemFocused(3)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'arrowdown'
        }
      });

      detectChanges();

      // It should loop back to first item.
      expect(isMenuItemFocused(0)).toEqual(true);

      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'arrowup'
        }
      });

      detectChanges();

      // It should loop back to last item.
      expect(isMenuItemFocused(3)).toEqual(true);

      // Try IE 11's 'up' key.
      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'up'
        }
      });

      detectChanges();

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

      detectChanges();

      const button = getButtonElement();
      const container = getMenuContainerElement();
      const menuItems = getMenuItems();

      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      detectChanges();

      expect(isElementVisible(container)).toEqual(true);
      expect(isMenuItemFocused(0)).toEqual(true);

      // Run 'tab'.
      const firstItemButton = menuItems.item(0).querySelector('button');
      SkyAppTestUtility.fireDomEvent(firstItemButton, 'keydown', {
        keyboardEventInit: {
          key: 'tab'
        }
      });

      detectChanges();

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

      detectChanges();

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

      detectChanges();

      expect(isElementVisible(container)).toEqual(false);
      expect(isElementFocused(button)).toEqual(true);

      // Re-open menu.
      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      detectChanges();

      expect(isElementVisible(container)).toEqual(true);

      // Run 'shift+tab' on first item.
      SkyAppTestUtility.fireDomEvent(firstItemButton, 'keydown', {
        keyboardEventInit: {
          key: 'tab',
          shiftKey: true
        }
      });

      detectChanges();

      expect(isElementVisible(container)).toEqual(false);
      expect(isElementFocused(button)).toEqual(true);
    }));

    it('should ignore menu keyboard events if menu is closed', fakeAsync(() => {
      detectChanges();

      const menu = getMenuElement();

      // Test menu 'keydown'.
      SkyAppTestUtility.fireDomEvent(menu, 'keydown', {
        keyboardEventInit: {
          key: 'arrowdown'
        }
      });

      detectChanges();

      expect(isMenuItemFocused(0)).toEqual(false);

      const messageSpy = spyOn(fixture.componentInstance.messageStream, 'next').and.callThrough();

      // Test menu 'keyup'.
      SkyAppTestUtility.fireDomEvent(menu, 'keyup', {
        keyboardEventInit: {
          key: 'escape'
        }
      });

      detectChanges();

      expect(messageSpy).not.toHaveBeenCalled();
    }));

    it('should ignore button keyboard events depending on menu visibility', fakeAsync(() => {
      detectChanges();

      const button = getButtonElement();

      // Open the menu.
      button.click();
      detectChanges();

      const messageSpy = spyOn(fixture.componentInstance.messageStream, 'next').and.callThrough();

      // Test trigger button 'keydown'.
      SkyAppTestUtility.fireDomEvent(button, 'keydown', {
        keyboardEventInit: {
          key: 'enter'
        }
      });

      detectChanges();

      // Enter key should be ignored if menu is open.
      expect(messageSpy).not.toHaveBeenCalledWith({
        type: SkyDropdownMessageType.Open
      });

      // Close the menu.
      button.click();
      detectChanges();

      // Reset spy.
      messageSpy.calls.reset();

      // Test trigger button 'keyup'.
      SkyAppTestUtility.fireDomEvent(button, 'keyup', {
        keyboardEventInit: {
          key: 'escape'
        }
      });

      detectChanges();

      // Escape key should be ignored if menu is closed.
      expect(messageSpy).not.toHaveBeenCalledWith({
        type: SkyDropdownMessageType.Close
      });
    }));
  });

  describe('message stream', function () {
    it('should open and close the menu', fakeAsync(() => {
      detectChanges();

      const container = getMenuContainerElement();

      // Verify the menu is closed on startup.
      expect(isElementVisible(container)).toEqual(false);

      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Open);
      detectChanges();

      expect(isElementVisible(container)).toEqual(true);

      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Close);
      detectChanges();

      expect(isElementVisible(container)).toEqual(false);
    }));

    it('should focus the trigger button', fakeAsync(() => {
      detectChanges();

      const button = getButtonElement();

      expect(isElementFocused(button)).toEqual(false);

      fixture.componentInstance.sendMessage(SkyDropdownMessageType.FocusTriggerButton);
      detectChanges();

      expect(isElementFocused(button)).toEqual(true);
    }));

    it('should allow navigating the menu', fakeAsync(() => {
      detectChanges();

      // Open the menu.
      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Open);
      detectChanges();

      // Focus the first item.
      fixture.componentInstance.sendMessage(SkyDropdownMessageType.FocusFirstItem);
      detectChanges();

      verifyActiveMenuItemByIndex(0);
      expect(isMenuItemFocused(0)).toEqual(true);

      // Focus the next item.
      fixture.componentInstance.sendMessage(SkyDropdownMessageType.FocusNextItem);
      detectChanges();

      // It should skip the second item because it is disabled.
      verifyActiveMenuItemByIndex(2);
      expect(isMenuItemFocused(2)).toEqual(true);

      // Focus the previous item.
      fixture.componentInstance.sendMessage(SkyDropdownMessageType.FocusPreviousItem);
      detectChanges();

      verifyActiveMenuItemByIndex(0);
      expect(isMenuItemFocused(0)).toEqual(true);
    }));

    it('should not open the menu if disabled', fakeAsync(() => {
      fixture.componentInstance.disabled = true;
      detectChanges();

      // Attempt to open the menu.
      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Open);
      detectChanges();

      const container = getMenuContainerElement();

      expect(isElementVisible(container)).toEqual(false);
    }));

    it('should allow repositioning the menu', fakeAsync(() => {
      detectChanges();

      const affixer = fixture.componentInstance.dropdownRef['affixer'];
      const affixSpy = spyOn(affixer, 'reaffix').and.callThrough();

      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Reposition);
      detectChanges();

      // Repositioning should only happen if menu is open.
      expect(affixSpy).not.toHaveBeenCalledWith();
      affixSpy.calls.reset();

      // Open the menu.
      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Open);
      detectChanges();

      // Reposition the menu.
      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Reposition);
      detectChanges();

      // The affixing method should be called now.
      expect(affixSpy).toHaveBeenCalledWith();
    }));
  });

  describe('focus properties', () => {

    it('should reflect the state of focus', fakeAsync(() => {
      detectChanges();

      const button = getButtonElement();
      const firstItemButton = getFirstMenuItem().querySelector('button');

      const dropdownRef = fixture.componentInstance.dropdownRef;

      expect(dropdownRef.buttonIsFocused).toEqual(false);
      expect(dropdownRef.menuIsFocused).toEqual(false);

      button.focus();
      detectChanges();

      expect(dropdownRef.buttonIsFocused).toEqual(true);
      expect(dropdownRef.menuIsFocused).toEqual(false);

      // Open the menu.
      button.click();
      detectChanges();

      // Move focus to first item.
      firstItemButton.focus();
      detectChanges();

      expect(dropdownRef.buttonIsFocused).toEqual(false);
      expect(dropdownRef.menuIsFocused).toEqual(true);
    }));
  });

  describe('accessibility', function () {
    it('should set ARIA attributes', fakeAsync(() => {
      detectChanges();

      const button = getButtonElement();

      button.click();
      detectChanges();

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

      detectChanges();
      detectChanges();

      expect(button.getAttribute('aria-label')).toEqual('button-label-override');
      expect(menu.getAttribute('role')).toEqual('menu-role-override');
      expect(menu.getAttribute('aria-labelledby')).toEqual('menu-labelled-by-override');
      expect(item.getAttribute('role')).toEqual('item-role-override');
    }));

    it('should set the title attribute', fakeAsync(() => {
      detectChanges();

      const button = getButtonElement();

      button.click();
      detectChanges();

      expect(button.getAttribute('title')).toBeNull();

      fixture.componentInstance.title = 'dropdown-title-override';
      detectChanges();

      expect(button.getAttribute('title')).toEqual('dropdown-title-override');
    }));

    it('should be accessible', async(() => {
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const button = getButtonElement();

        button.click();

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          expect(window.document.body).toBeAccessible();
        });
      });
    }));
  });
});

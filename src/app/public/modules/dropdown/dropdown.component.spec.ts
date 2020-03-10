import {
  async,
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';

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

describe('Dropdown component', () => {

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

  function getFirstMenuItem(): Element {
    return getMenuElement().querySelectorAll('.sky-dropdown-item').item(0);
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

  it('should allow setting button style and type', () => {
    fixture.componentInstance.buttonStyle = 'danger';
    fixture.componentInstance.buttonType = 'context-menu';

    fixture.detectChanges();

    const button = getButtonElement();
    expect(button).toHaveCssClass('sky-btn-danger');
    expect(button).toHaveCssClass('sky-dropdown-button-type-context-menu');
  });

  it('should open and close menu via click', fakeAsync(() => {
    fixture.componentInstance.trigger = 'click';
    fixture.detectChanges();
    tick();

    const button = getButtonElement();

    button.click();
    fixture.detectChanges();
    tick();

    const dropdownMenu = getMenuElement();
    expect(isElementVisible(dropdownMenu)).toEqual(true);

    button.click();
    fixture.detectChanges();
    tick();

    expect(isElementVisible(dropdownMenu)).toEqual(false);
  }));

  it('should open and close menu via mouse hover', fakeAsync(() => {
    fixture.componentInstance.trigger = 'hover';
    fixture.detectChanges();
    tick();

    const button = getButtonElement();

    SkyAppTestUtility.fireDomEvent(button, 'mouseenter');
    fixture.detectChanges();
    tick();

    const dropdownMenu = getMenuContainerElement();
    expect(isElementVisible(dropdownMenu)).toEqual(true);

    SkyAppTestUtility.fireDomEvent(button, 'mouseleave');

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();

    expect(isElementVisible(dropdownMenu)).toEqual(false);
  }));

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

  describe('message stream', function () {
    it('should open and close the menu', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      const dropdownMenu = getMenuContainerElement();

      // Verify the menu is closed on startup.
      expect(isElementVisible(dropdownMenu)).toEqual(false);

      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Open);
      fixture.detectChanges();
      tick();

      expect(isElementVisible(dropdownMenu)).toEqual(true);

      fixture.componentInstance.sendMessage(SkyDropdownMessageType.Close);
      fixture.detectChanges();
      tick();

      expect(isElementVisible(dropdownMenu)).toEqual(false);
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

      const menu = getMenuContainerElement();

      expect(isElementVisible(menu)).toEqual(false);
    }));
  });

});

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

describe('Dropdown component', () => {

  let fixture: ComponentFixture<DropdownFixtureComponent>;

  function getButtonElement(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.sky-dropdown-button');
  }

  function getMenuElement(): Element {
    return document.querySelector('.sky-dropdown-menu');
  }

  function getFirstMenuItem(): Element {
    const menu = getMenuElement();
    return menu.querySelectorAll('.sky-dropdown-item').item(0);
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
    expect(dropdownRef.label).toBeUndefined();
    expect(dropdownRef.title).toBeUndefined();
    expect(dropdownRef.trigger).toEqual('click');

    const menuRef = fixture.componentInstance.dropdownMenuRef;
    expect(menuRef.ariaLabelledBy).toBeUndefined();
    expect(menuRef.ariaRole).toEqual('menu');
    expect(menuRef.horizontalAlignment).toEqual('left');
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
    expect(dropdownMenu).not.toHaveCssClass('hidden');

    button.click();
    fixture.detectChanges();
    tick();

    expect(dropdownMenu).toHaveCssClass('hidden');
  }));

  it('should open and close menu via mouse hover', fakeAsync(() => {
    fixture.componentInstance.trigger = 'hover';
    fixture.detectChanges();
    tick();

    const button = getButtonElement();

    SkyAppTestUtility.fireDomEvent(button, 'mouseenter');
    fixture.detectChanges();
    tick();

    const dropdownMenu = getMenuElement();
    expect(dropdownMenu).not.toHaveCssClass('hidden');

    SkyAppTestUtility.fireDomEvent(button, 'mouseleave');

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();

    expect(dropdownMenu).toHaveCssClass('hidden');
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

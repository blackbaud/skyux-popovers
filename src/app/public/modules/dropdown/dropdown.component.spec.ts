import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  expect
} from '@skyux-sdk/testing';

import {
  SkyDropdownFixturesModule
} from './fixtures/dropdown-fixtures.module';

import {
  DropdownFixtureComponent
} from './fixtures/dropdown.component.fixture';

describe('Dropdown component', () => {

  let fixture: ComponentFixture<DropdownFixtureComponent>;

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
  });
});

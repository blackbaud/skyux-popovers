import {
  DebugElement
} from '@angular/core';

import {
  ComponentFixture
} from '@angular/core/testing';

import {
  By
} from '@angular/platform-browser';

import {
  SkyAppTestUtility
} from '@skyux-sdk/testing';

import {
  SkyDropdownComponent
} from '../modules/dropdown/dropdown.component';

import {
  SkyDropdownFixtureDropdownItem
} from './dropdown-fixture-dropdown-item';

import {
  SkyDropdownFixtureDropdownMenu
} from './dropdown-fixture-dropdown-menu';

import {
  SkyDropdownFixtureDropdown
} from './dropdown-fixture-dropdown';

/**
 * Allows interaction with a SKY UX dropdown component just as a user would.
 * By using the fixture API, a test insulates itself against updates to the internals
 * of a component, such as changing its DOM structure.
 */
export class SkyDropdownFixture {

  private debugEl: DebugElement;

  /**
   * Retrieves information about the dropdown component.
   */
  public get dropdown(): SkyDropdownFixtureDropdown {{
    const button = this.buttonDebugElement;

    if (!button) {
      return undefined;
    }

    const buttonCmp = button.componentInstance as SkyDropdownComponent;

    return {
      buttonStyle: buttonCmp.buttonStyle,
      buttonType: buttonCmp.buttonType,
      disabled: buttonCmp.disabled,
      dismissOnBlur: buttonCmp.dismissOnBlur,
      horizontalAlignment: buttonCmp.horizontalAlignment,
      label: buttonCmp.label,
      title: buttonCmp.title
    };
  }}

  /**
   * Returns the dropdown button's text.
   */
  public get dropdownButtonText(): string {
    return this.buttonDebugElement.nativeElement.innerText;
  }

  /**
   * Retrieves information about the dropdown menu component.
   */
  public get dropdownMenu(): SkyDropdownFixtureDropdownMenu {
    const menu = this.getOverlay().querySelector('.sky-dropdown-menu');
    if (!menu) {
      return undefined;
    }

    return {
      ariaLabelledBy: menu.getAttribute('aria-labelledby'),
      ariaRole: menu.getAttribute('role')
    };
  }

  /**
   * Indicates if the dropdown menu is open and visible.
   */
  public get dropdownMenuIsVisible(): boolean {
    const overlay = this.getOverlay();

    if (!overlay) {
      /* tslint:disable-next-line:no-null-keyword */
      return false;
    }

    return this.getOverlay().querySelector('.sky-dropdown-menu') !== null;
  }

  private get buttonDebugElement(): DebugElement {
    return this.debugEl.query(
      By.css('.sky-dropdown-button')
    );
  }

  constructor(
    private fixture: ComponentFixture<any>,
    skyTestId: string
  ) {
    this.debugEl = SkyAppTestUtility.getDebugElementByTestId(fixture, skyTestId, 'sky-dropdown');
  }

  /**
   * Click the dropdown button to open or close the dropdown menu.
   */
  public async clickDropdownButton(): Promise<any> {
    this.buttonDebugElement.nativeElement.click();
    this.fixture.detectChanges();
    return this.fixture.whenStable();
  }

  /**
   * Click the dropdown item at the provided index.
   */
  public async clickDropdownItem(index: number): Promise<any> {
    const itemEls = this.getDropdownItemEls();
    if (index >= itemEls.length) {
      throw new Error(`There is no dropdown item at index ${index}.`);
    }

    itemEls[index].click();

    this.fixture.detectChanges();
    return this.fixture.whenStable();
  }

  /**
   * Retrieves information about the dropdown item at the provided index.
   */
  public getDropdownItem(index: number): SkyDropdownFixtureDropdownItem {{
    const item = this.getDropdownItemEls()[index];
    if (!item) {
      return undefined;
    }

    return {
      ariaRole: item.getAttribute('role')
    };
  }}

  /**
   * Returns the first element inside the dropdown menu
   * that is a descendant of the provided selector.
   */
  public querySelector(selector: string): any {
    const overlay = this.getOverlay();
    if (!overlay) {
      /* tslint:disable-next-line:no-null-keyword */
      return null;
    }

    return overlay.querySelector(selector);
  }

  /**
   * Returns all elements inside the dropdown menu
   * that are descendants of the provided selector.
   */
  public querySelectorAll(selector: string): NodeListOf<any> {
    const overlay = this.getOverlay();
    if (!overlay) {
      /* tslint:disable-next-line:no-null-keyword */
      return null;
    }

    return overlay.querySelectorAll(selector);
  }

  private getDropdownItemEls(): NodeListOf<any> {
    return this.getOverlay().querySelectorAll('.sky-dropdown-item');
  }

  private getOverlay(): HTMLElement {
    return document.querySelector('sky-overlay');
  }
}

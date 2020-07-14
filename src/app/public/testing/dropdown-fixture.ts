import {
  ComponentFixture,
  tick
} from '@angular/core/testing';

import {
  DebugElement
} from '@angular/core';

import {
  By
} from '@angular/platform-browser';

import {
  SkyAppTestUtility
} from '@skyux-sdk/testing';

/**
 * Allows interaction with a SKY UX dropdown component just as a user would.
 * By using the fixture API, a test insulates itself against updates to the internals
 * of a component, such as changing its DOM structure.
 */
export class SkyDropdownFixture {

  private debugEl: DebugElement;

  private hostSelector: string = 'sky-dropdown';

  constructor(
    private fixture: ComponentFixture<any>,
    skyTestId: string
  ) {
    this.debugEl = SkyAppTestUtility.getDebugElementByTestId(fixture, skyTestId, this.hostSelector);
  }

  public getHost(): any {

  }

  /**
   * The dropdown button's inner text.
   */
  public get innerText(): string {
    return this.getDropdownButtonDebugElement().nativeElement.innerText;
  }

  /**
   * Indicates if the dropdown button is disabled.
   */
  public get disabled(): boolean {
    return this.getDropdownButtonDebugElement().nativeElement.disabled;
  }

  public get menuEl(): any {
    return document.querySelector('.sky-dropdown-menu');
  }

  public get itemEls(): NodeListOf<any> {
    return document.querySelectorAll('.sky-dropdown-item');
  }

  public get buttonEl(): any {
    return document.querySelector('.sky-dropdown-button');
  }

  public clickDropdownButton(): Promise<any> {
    this.getDropdownButtonDebugElement().nativeElement.click();
    this.fixture.detectChanges();
    return this.fixture.whenStable();
  }

  public clickItem(itemIndex: number): Promise<any> {
    if (itemIndex >= this.itemEls.length) {
      throw new Error(`There is no tab at index ${itemIndex}.`);
    }

    this.itemEls[itemIndex].click();

    this.fixture.detectChanges();
    return this.fixture.whenStable();
  }

  private getDropdownButtonDebugElement(): DebugElement {
    return this.debugEl.query(
      By.css('.sky-dropdown-button')
    );
  }
}

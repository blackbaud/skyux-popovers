import {
  async,
  TestBed
} from '@angular/core/testing';

import {
  Component
} from '@angular/core';

import {
  expect
} from '@skyux-sdk/testing';

import {
  SkyDropdownMenuChange,
  SkyDropdownModule
} from '@skyux/popovers';

import {
  SkyDropdownFixture
} from './dropdown-fixture';

const DATA_SKY_ID = 'test-dropdown';

//#region Test component
@Component({
  selector: 'dropdown-test',
  template: `
<sky-dropdown
  data-sky-id="${DATA_SKY_ID}"
  [buttonStyle]="buttonStyle"
  [disabled]="disabled"
  [label]="label"
>
  <sky-dropdown-button>
    {{ dropdownButtonText }}
  </sky-dropdown-button>
  <sky-dropdown-menu
    (menuChanges)="onMenuChanges($event)"
  >
    <sky-dropdown-item *ngFor="let item of items">
      <button
        type="button"
        [attr.disabled]="item.disabled ? '' : null"
      >
        {{ item.name }}
      </button>
    </sky-dropdown-item>
  </sky-dropdown-menu>
</sky-dropdown>
`
})
class TestComponent {

  public activeIndex: number;

  public buttonStyle = 'primary';

  public disabled: boolean = false;

  public dropdownButtonText: string = 'Show dropdown';

  public items: any[] = [
    { name: 'Option 1' },
    { name: 'Option 2', disabled: true },
    { name: 'Option 3' }
  ];

  public label: string = 'A11y descriptor';

  public onMenuChanges(itemName: SkyDropdownMenuChange): void {
    if (itemName.activeIndex) {
      this.activeIndex = itemName.activeIndex;
    }
  }

}
//#endregion Test component

describe('Dropdown fixture', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TestComponent
      ],
      imports: [
        SkyDropdownModule
      ]
    });
  });

  it('should expose the provided properties for the dropdown button', async(() => {
    const fixture = TestBed.createComponent(
      TestComponent
    );
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();

    const dropdown = new SkyDropdownFixture(fixture, DATA_SKY_ID);

    expect(dropdown.disabled).toEqual(true);
    expect(dropdown.innerText).toEqual(fixture.componentInstance.dropdownButtonText);
    expect(dropdown.buttonEl.getAttribute('aria-label')).toEqual(fixture.componentInstance.label);
  }));

  it('should open and close the dropdown when clicked', async() => {
    const fixture = TestBed.createComponent(
      TestComponent
    );
    fixture.detectChanges();

    const dropdown = new SkyDropdownFixture(fixture, DATA_SKY_ID);

    await dropdown.clickDropdownButton();
    expect(dropdown.menuEl).not.toBeNull();

    await dropdown.clickDropdownButton();
    expect(dropdown.menuEl).toBeNull();
  });

  it('should expose provided properties for the dropdown items', async() => {
    const fixture = TestBed.createComponent(
      TestComponent
    );
    fixture.detectChanges();

    const dropdown = new SkyDropdownFixture(fixture, DATA_SKY_ID);

    await dropdown.clickDropdownButton();

    expect(dropdown.itemEls).not.toBeNull();
    expect(dropdown.itemEls.length).toEqual(3);

    expect(dropdown.itemEls[0].textContent.trim()).toEqual('Option 1');
    expect(dropdown.itemEls[0].querySelector('button').disabled).toEqual(false);

    expect(dropdown.itemEls[1].textContent.trim()).toEqual('Option 2');
    expect(dropdown.itemEls[1].querySelector('button').disabled).toEqual(true);

    expect(dropdown.itemEls[2].textContent.trim()).toEqual('Option 3');
    expect(dropdown.itemEls[2].querySelector('button').disabled).toEqual(false);
  });

  it('should allow a dropdown item to be clicked', async() => {
    const fixture = TestBed.createComponent(
      TestComponent
    );
    fixture.detectChanges();

    const dropdown = new SkyDropdownFixture(fixture, DATA_SKY_ID);

    await dropdown.clickDropdownButton();

    expect(fixture.componentInstance.activeIndex).toBeUndefined();

    await dropdown.clickItem(2);

    expect(fixture.componentInstance.activeIndex).toEqual(2);
  });
});

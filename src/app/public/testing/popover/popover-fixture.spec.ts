import {
  fakeAsync,
  TestBed,
  ComponentFixture,
  tick
} from '@angular/core/testing';

import {
  Component
} from '@angular/core';

import {
  expect
} from '@skyux-sdk/testing';

import {
  SkyPopoverModule
} from '@skyux/popovers';

import {
  SkyPopoverFixture
} from './popover-fixture';

import {
  SkyAppTestUtility
} from '@skyux-sdk/testing';

const DATA_SKY_ID = 'test-popover';

//#region Test component
@Component({
  selector: 'popover-test',
  template: `
<button
  class="sky-btn sky-margin-inline-compact"
  type="button"
  [skyPopover]="myPopover"
  [skyPopoverAlignment]="popoverAlignment"
  [skyPopoverPlacement]="popoverPlacement"
  #directiveRef
>
  Open popover on click
</button>

<sky-popover
  data-sky-id="${DATA_SKY_ID}"
  [popoverTitle]="popoverTitle"
  [dismissOnBlur]="dismissOnBlur"
  #myPopover
>
  {{popoverBody}}
</sky-popover>
`
})
class PopoverTestComponent {
  public popoverAlignment: string;
  public popoverPlacement: string;
  public popoverTitle: string = 'popover title';
  public popoverBody: string = 'popover body';
  public dismissOnBlur: boolean;
}
//#endregion Test component

describe('Popover fixture', () => {
  let fixture: ComponentFixture<PopoverTestComponent>;
  let testComponent: PopoverTestComponent;
  let popoverFixture: SkyPopoverFixture;

  //#region helpers
  function getCallerElement(): HTMLButtonElement {
    return document.querySelector('.sky-btn');
  }

  function detectChangesFakeAsync(): void {
    fixture.detectChanges();
    tick();

    fixture.detectChanges();
    tick();
  }

  function openPopover(): void {
    expect(popoverFixture.popoverIsVisible).toEqual(false);

    let caller = getCallerElement();
    caller.click();
    detectChangesFakeAsync();

    expect(popoverFixture.popoverIsVisible).toEqual(true);
  }
  //#endregion

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        PopoverTestComponent
      ],
      imports: [
        SkyPopoverModule
      ]
    });

    fixture = TestBed.createComponent(
      PopoverTestComponent
    );
    testComponent = fixture.componentInstance;
    fixture.detectChanges();
    popoverFixture = new SkyPopoverFixture(fixture, DATA_SKY_ID);
  });

  it('should not expose popover properties when hidden', fakeAsync(async () => {
    // the popover should be hidden
    expect(popoverFixture.popoverIsVisible).toEqual(false);

    // expect all values to be undefined since the popover element does not exist
    expect(popoverFixture.title).toBeUndefined();
    expect(popoverFixture.body).toBeUndefined();
    expect(popoverFixture.alignment).toBeUndefined();
    expect(popoverFixture.position).toBeUndefined();
  }));

  it('should expose popover properties when visible', fakeAsync(async () => {
    // give properties non-default values
    testComponent.popoverTitle = 'my title';
    testComponent.popoverBody = 'my popover message';
    testComponent.popoverAlignment = 'left';
    testComponent.popoverPlacement = 'below';
    fixture.detectChanges();

    // the popover is closed initially, we need to open it to check values
    openPopover();

    // expect all values to be undefined since the popover element does not exist
    expect(popoverFixture.title).toEqual(testComponent.popoverTitle);
    expect(SkyAppTestUtility.getText(popoverFixture.body)).toEqual(testComponent.popoverBody);
    expect(popoverFixture.alignment).toEqual(testComponent.popoverAlignment);
    expect(popoverFixture.position).toEqual(testComponent.popoverPlacement);
  }));

  it('should hide by default when blur is invoked', fakeAsync(async () => {
    // open the popover
    openPopover();

    // blur
    await popoverFixture.blur();
    detectChangesFakeAsync();

    // expect the popover to be dismissed
    expect(popoverFixture.popoverIsVisible).toEqual(false);
  }));

  it('should honor dismissOnBlur flag', fakeAsync(async () => {
    // oveerride the dismissOnBlur default
    testComponent.dismissOnBlur = false;
    fixture.detectChanges();

    // open the popover
    openPopover();

    // blur
    await popoverFixture.blur();
    detectChangesFakeAsync();

    // expect the popover to remain open
    expect(popoverFixture.popoverIsVisible).toEqual(true);
  }));
});

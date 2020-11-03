import {
  Component
} from '@angular/core';

import {
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
  SkyPopoverFixture
} from './popover-fixture';

import {
  SkyPopoverTestingModule
} from './popover-testing.module';

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
  [dismissOnBlur]="dismissOnBlur"
  [popoverTitle]="popoverTitle"
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
  function getPopoverTriggerEl(): HTMLButtonElement {
    return document.querySelector('.sky-btn');
  }

  function detectChangesFakeAsync(): void {
    fixture.detectChanges();
    tick();
  }

  function openPopover(): void {
    expect(popoverFixture.popoverIsVisible).toEqual(false);

    let triggerEl = getPopoverTriggerEl();
    triggerEl.click();
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
        SkyPopoverTestingModule
      ]
    });

    fixture = TestBed.createComponent(
      PopoverTestComponent
    );
    testComponent = fixture.componentInstance;
    fixture.detectChanges();
    popoverFixture = new SkyPopoverFixture(fixture);
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

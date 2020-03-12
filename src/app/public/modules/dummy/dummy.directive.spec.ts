import { TestBed, tick, ComponentFixture, fakeAsync } from '@angular/core/testing';
import { DummyFixtureComponent } from './fixtures/dummy.component.fixture';
import { DummyFixturesModule } from './fixtures/dummy.module.fixture';
import { expect } from '@skyux-sdk/testing';

describe('Dummy directive', function () {

  let fixture: ComponentFixture<DummyFixtureComponent>;

  function getButtonElement(): HTMLElement {
    return fixture.debugElement.nativeElement.querySelector('.trigger-btn');
  }

  function getDummyElement(fix: ComponentFixture<DummyFixtureComponent>): HTMLElement {
    return fix.componentInstance.dummyRef['elementRef'].nativeElement;
  }

  function isElementVisible(elem: Element): boolean {
    return (getComputedStyle(elem).visibility !== 'hidden');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        DummyFixturesModule
      ]
    });

    fixture = TestBed.createComponent(DummyFixtureComponent);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();

    expect(isElementVisible(getDummyElement(fixture))).toEqual(false);

    const button = getButtonElement();

    button.click();

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();

    expect(isElementVisible(getDummyElement(fixture))).toEqual(true);
  }));

  it('should', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();

    expect(isElementVisible(getDummyElement(fixture))).toEqual(false);

    const button = getButtonElement();

    button.click();

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();

    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();

    expect(isElementVisible(getDummyElement(fixture))).toEqual(true);
  }));

  // it('should', fakeAsync(() => {
  //   fixture.detectChanges();
  //   tick();
  //   fixture.detectChanges();
  //   tick();

  //   fixture.detectChanges();
  //   tick();
  //   fixture.detectChanges();
  //   tick();

  //   expect(isElementVisible(getDummyElement(fixture))).toEqual(false);

  //   const button = getButtonElement();

  //   button.click();

  //   fixture.detectChanges();
  //   tick();
  //   fixture.detectChanges();
  //   tick();

  //   fixture.detectChanges();
  //   tick();
  //   fixture.detectChanges();
  //   tick();

  //   expect(isElementVisible(getDummyElement(fixture))).toEqual(true);
  // }));

});

import {
  ElementRef,
  Renderer2
} from '@angular/core';

import {
  inject,
  TestBed
} from '@angular/core/testing';

import {
  SkyWindowRefService
} from '@skyux/core';

import {
  SkyPopoverAdapterService
} from './popover-adapter.service';

describe('SkyPopoverAdapterService', () => {
  let mockRenderer: any;
  let mockBody: any;

  class MockWindowService {
    public getWindow(): any {
      return {
        innerWidth: 1000,
        innerHeight: 1000,
        document: {
          body: mockBody
        },
        getComputedStyle() {}
      };
    }
  }

  beforeEach(() => {
    mockRenderer = {
      removeStyle() {},
      setStyle() {},
      addClass() {},
      removeClass() {},
      listen() {}
    };

    mockBody = {};

    TestBed.configureTestingModule({
      providers: [
        SkyPopoverAdapterService,
        { provide: Renderer2, useValue: mockRenderer },
        { provide: SkyWindowRefService, useValue: new MockWindowService() }
      ]
    });
  });

  it('should hide a popover',
    inject([SkyPopoverAdapterService], (adapterService: SkyPopoverAdapterService) => {
      const spy = spyOn(adapterService['renderer'], 'addClass');
      const elem = new ElementRef({ nativeElement: {} });
      adapterService.hidePopover(elem);
      expect(spy).toHaveBeenCalledWith(elem.nativeElement, 'sky-popover-hidden');
    })
  );

  it('should show a popover',
    inject([SkyPopoverAdapterService], (adapterService: SkyPopoverAdapterService) => {
      const spy = spyOn(adapterService['renderer'], 'removeClass');
      const elem = new ElementRef({ nativeElement: {} });
      adapterService.showPopover(elem);
      expect(spy).toHaveBeenCalledWith(elem.nativeElement, 'sky-popover-hidden');
    })
  );
});

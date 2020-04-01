import {
  ElementRef
} from '@angular/core';

import {
  SkyPopoverAdapterService
} from './popover-adapter.service';

describe('SkyPopoverAdapterService', () => {

  let adapter: SkyPopoverAdapterService;
  let callerElement: any;
  let popoverArrowElement: any;

  beforeEach(() => {
    callerElement = {
      getBoundingClientRect() {
        return {
          left: 500,
          top: 500,
          bottom: 550,
          width: 100,
          height: 50
        };
      }
    };

    popoverArrowElement = {
      getBoundingClientRect() {
        return {
          width: 40,
          height: 20
        };
      }
    };

    adapter = new SkyPopoverAdapterService();
  });

  describe('placement above', () => {

    it('should assign appropriate offset to arrow', () => {
      const popoverElement: any = {
        getBoundingClientRect() {
          return {
            left: 500,
            right: 600,
            top: 400,
            bottom: 500
          };
        }
      };

      const offset = adapter.getArrowCoordinates({
        caller: new ElementRef(callerElement),
        popover: new ElementRef(popoverElement),
        popoverArrow: new ElementRef(popoverArrowElement)
      }, 'above');

      expect(offset).toEqual({ top: 480, left: 550 });
    });

    it('should not detach arrow from popover left', () => {
      const popoverElement: any = {
        getBoundingClientRect() {
          return {
            left: 700,
            right: 800,
            top: 400,
            bottom: 500
          };
        }
      };

      const offset = adapter.getArrowCoordinates({
        caller: new ElementRef(callerElement),
        popover: new ElementRef(popoverElement),
        popoverArrow: new ElementRef(popoverArrowElement)
      }, 'above');

      expect(offset).toEqual({ top: 480, left: 720 });
    });

    it('should not detach arrow from popover right', () => {
      const popoverElement: any = {
        getBoundingClientRect() {
          return {
            left: 300,
            right: 400,
            top: 400,
            bottom: 500
          };
        }
      };

      const offset = adapter.getArrowCoordinates({
        caller: new ElementRef(callerElement),
        popover: new ElementRef(popoverElement),
        popoverArrow: new ElementRef(popoverArrowElement)
      }, 'above');

      expect(offset).toEqual({ top: 480, left: 380 });
    });
  });

  describe('placement below', () => {

    it('should assign appropriate offset to arrow', () => {
      const popoverElement: any = {
        getBoundingClientRect() {
          return {
            left: 500,
            right: 600,
            top: 550,
            bottom: 600
          };
        }
      };

      const offset = adapter.getArrowCoordinates({
        caller: new ElementRef(callerElement),
        popover: new ElementRef(popoverElement),
        popoverArrow: new ElementRef(popoverArrowElement)
      }, 'below');

      expect(offset).toEqual({ top: 550, left: 550 });
    });

    it('should not detach arrow from popover left', () => {
      const popoverElement: any = {
        getBoundingClientRect() {
          return {
            left: 700,
            right: 800,
            top: 550,
            bottom: 600
          };
        }
      };

      const offset = adapter.getArrowCoordinates({
        caller: new ElementRef(callerElement),
        popover: new ElementRef(popoverElement),
        popoverArrow: new ElementRef(popoverArrowElement)
      }, 'below');

      expect(offset).toEqual({ top: 550, left: 720 });
    });

    it('should not detach arrow from popover right', () => {
      const popoverElement: any = {
        getBoundingClientRect() {
          return {
            left: 300,
            right: 400,
            top: 550,
            bottom: 600
          };
        }
      };

      const offset = adapter.getArrowCoordinates({
        caller: new ElementRef(callerElement),
        popover: new ElementRef(popoverElement),
        popoverArrow: new ElementRef(popoverArrowElement)
      }, 'below');

      expect(offset).toEqual({ top: 550, left: 380 });
    });
  });

  describe('placement left', () => {
    it('should assign appropriate offset to arrow', () => {
      const popoverElement: any = {
        getBoundingClientRect() {
          return {
            left: 500,
            right: 600,
            top: 450,
            bottom: 550
          };
        }
      };

      const offset = adapter.getArrowCoordinates({
        caller: new ElementRef(callerElement),
        popover: new ElementRef(popoverElement),
        popoverArrow: new ElementRef(popoverArrowElement)
      }, 'left');

      expect(offset).toEqual({ top: 525, left: 460 });
    });

    it('should not detach arrow from popover top', () => {
      const popoverElement: any = {
        getBoundingClientRect() {
          return {
            left: 500,
            right: 600,
            top: 850,
            bottom: 950
          };
        }
      };

      const offset = adapter.getArrowCoordinates({
        caller: new ElementRef(callerElement),
        popover: new ElementRef(popoverElement),
        popoverArrow: new ElementRef(popoverArrowElement)
      }, 'left');

      expect(offset).toEqual({ top: 870, left: 460 });
    });

    it('should not detach arrow from popover bottom', () => {
      const popoverElement: any = {
        getBoundingClientRect() {
          return {
            left: 500,
            right: 600,
            top: 250,
            bottom: 350
          };
        }
      };

      const offset = adapter.getArrowCoordinates({
        caller: new ElementRef(callerElement),
        popover: new ElementRef(popoverElement),
        popoverArrow: new ElementRef(popoverArrowElement)
      }, 'left');

      expect(offset).toEqual({ top: 330, left: 460 });
    });
  });

  describe('placement right', () => {
    it('should assign appropriate offset to arrow', () => {
      const popoverElement: any = {
        getBoundingClientRect() {
          return {
            left: 600,
            right: 700,
            top: 450,
            bottom: 550
          };
        }
      };

      const offset = adapter.getArrowCoordinates({
        caller: new ElementRef(callerElement),
        popover: new ElementRef(popoverElement),
        popoverArrow: new ElementRef(popoverArrowElement)
      }, 'right');

      expect(offset).toEqual({ top: 525, left: undefined });
    });

    it('should not detach arrow from popover top', () => {
      const popoverElement: any = {
        getBoundingClientRect() {
          return {
            left: 600,
            right: 700,
            top: 850,
            bottom: 950
          };
        }
      };

      const offset = adapter.getArrowCoordinates({
        caller: new ElementRef(callerElement),
        popover: new ElementRef(popoverElement),
        popoverArrow: new ElementRef(popoverArrowElement)
      }, 'right');

      expect(offset).toEqual({ top: 870, left: undefined });
    });

    it('should not detach arrow from popover bottom', () => {
      const popoverElement: any = {
        getBoundingClientRect() {
          return {
            left: 600,
            right: 700,
            top: 250,
            bottom: 350
          };
        }
      };

      const offset = adapter.getArrowCoordinates({
        caller: new ElementRef(callerElement),
        popover: new ElementRef(popoverElement),
        popoverArrow: new ElementRef(popoverArrowElement)
      }, 'right');

      expect(offset).toEqual({ top: 330, left: undefined });
    });
  });

});

import { SkyPopoverPlacement, SkyPopoverAlignment } from './types';
import { SkyAffixPlacement, SkyAffixHorizontalAlignment } from '@skyux/core';

export function parseAffixPlacement(
  placement: SkyPopoverPlacement
): SkyAffixPlacement {
  switch (placement) {
    case 'above':
      return 'above';
    case 'below':
      return 'below';
    case 'right':
      return 'right';
    case 'left':
      return 'left';
    default:
      throw `SkyAffixPlacement does not have a matching value for '${placement}'!`;
  }
}

export function parseAffixHorizontalAlignment(
  alignment: SkyPopoverAlignment
): SkyAffixHorizontalAlignment {
  switch (alignment) {
    case 'center':
      return 'center';
    case 'left':
      return 'left';
    case 'right':
      return 'right';
    default:
      throw `SkyAffixHorizontalAlignment does not have a matching value for '${alignment}'!`;
  }
}

import {
  animate,
  trigger,
  state,
  style,
  transition
} from '@angular/animations';

export const skyPopoverAnimation = trigger('popoverState', [
  state('visible', style({ opacity: 1, visibility: 'visible' })),
  state('hidden', style({ opacity: 0 })),
  transition('hidden => visible', animate('150ms')),
  transition('visible => hidden', animate('150ms'))
]);

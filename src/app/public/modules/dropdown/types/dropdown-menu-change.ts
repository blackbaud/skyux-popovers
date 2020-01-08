import {
  SkyDropdownItemComponent
} from '../dropdown-item.component';

export interface SkyDropdownMenuChange {
  /**
   * Indicates the active menu index. This property accepts `number` values.
   */
  activeIndex?: number;

  /**
   * Indicates the items in the menu. This property accepts values of type `SkyDropdownItemComponent`.
   */
  items?: SkyDropdownItemComponent[];

  /**
   * Indicates the selected item in the menu. This property accepts values of type `SkyDropdownItemComponent`.
   */
  selectedItem?: SkyDropdownItemComponent;
}

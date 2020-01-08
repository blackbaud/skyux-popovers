import {
  SkyDropdownMessageType
} from './dropdown-message-type';

export interface SkyDropdownMessage {

  /**
   * Sets `SkyDropdownMessage` to one of the following listed in
   * [Enumerations](https://developer.blackbaud.com/skyux-popovers/docs/dropdown?docs-active-tab=development#section-enumerations):
   */
  type?: SkyDropdownMessageType;
}

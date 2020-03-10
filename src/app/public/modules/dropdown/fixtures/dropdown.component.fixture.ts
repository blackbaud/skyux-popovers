import {
  Component,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';

import {
  Subject
} from 'rxjs/Subject';

import {
  SkyPopoverAlignment
} from '../../popover/types/popover-alignment';

import {
  SkyDropdownHorizontalAlignment
} from '../types/dropdown-horizontal-alignment';

import {
  SkyDropdownMessage
} from '../types/dropdown-message';

import {
  SkyDropdownMessageType
} from '../types/dropdown-message-type';

import {
  SkyDropdownTriggerType
} from '../types/dropdown-trigger-type';

import {
  SkyDropdownItemComponent
} from '../dropdown-item.component';

import {
  SkyDropdownMenuComponent
} from '../dropdown-menu.component';

import {
  SkyDropdownComponent
} from '../dropdown.component';

@Component({
  selector: 'sky-test-cmp',
  templateUrl: './dropdown.component.fixture.html'
})
export class DropdownFixtureComponent {

  //#region directive properties

  public alignment: SkyPopoverAlignment;

  public buttonStyle: string;

  public buttonType: string;

  public disabled: boolean;

  public dismissOnBlur: boolean;

  public horizontalAlignment: SkyDropdownHorizontalAlignment;

  public itemAriaRole: string;

  public label: string;

  public messageStream = new Subject<SkyDropdownMessage>();

  public menuAriaLabelledBy: string;

  public menuAriaRole: string;

  public title: string;

  public trigger: SkyDropdownTriggerType;

  public useNativeFocus: boolean;

  //#endregion directive properties

  @ViewChild('dropdownRef', {
    read: SkyDropdownComponent
  })
  public dropdownRef: SkyDropdownComponent;

  @ViewChild('dropdownMenuRef', {
    read: SkyDropdownMenuComponent
  })
  public dropdownMenuRef: SkyDropdownMenuComponent;

  @ViewChildren(SkyDropdownItemComponent)
  public dropdownItemRefs: QueryList<SkyDropdownItemComponent>;

  public items: any[] = [
    { name: 'Option 1', disabled: false },
    { name: 'Option 2', disabled: true },
    { name: 'Option 3', disabled: false },
    { name: 'Option 4', disabled: false }
  ];

  public onMenuChanges(): void { }

  public sendMessage(type: SkyDropdownMessageType) {
    this.messageStream.next({ type });
  }

}

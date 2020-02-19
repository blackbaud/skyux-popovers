import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';

import {
  Subject
} from 'rxjs';

import {
  SkyDropdownMessage
} from '../types/dropdown-message';

import {
  SkyDropdownMessageType
} from '../types/dropdown-message-type';

import {
  SkyDropdownComponent
} from '../dropdown.component';

import {
  SkyDropdownMenuComponent
} from '../dropdown-menu.component';

@Component({
  selector: 'sky-test-cmp',
  templateUrl: './dropdown.component.fixture.html'
})
export class DropdownTestComponent {
  public alignment: string;
  public buttonStyle: string;
  public buttonType: String;
  public label: string;
  public title: string;
  public trigger: String;
  public dropdownController = new Subject<SkyDropdownMessage>();
  public isDisabled: boolean;

  public items: any[] = [
    { name: 'Option 1', disabled: false },
    { name: 'Option 2', disabled: true },
    { name: 'Option 3', disabled: false },
    { name: 'Option 4', disabled: false }
  ];

  @ViewChild('dropdown', {
    read: SkyDropdownComponent,
    static: false
  })
  public dropdown: SkyDropdownComponent;

  @ViewChild('dropdownMenu', {
    read: SkyDropdownMenuComponent,
    static: false
  })
  public dropdownMenu: SkyDropdownMenuComponent;

  @ViewChild('outsideButton', {
    read: ElementRef,
    static: false
  })
  public outsideButton: ElementRef;

  constructor(
    private changeDetector: ChangeDetectorRef
  ) { }

  public sendMessage(type: SkyDropdownMessageType) {
    this.dropdownController.next({ type });
  }

  public changeItems() {
    this.items.pop();
    this.changeDetector.detectChanges();
  }

  public setItems(items: any[]) {
    this.items = items;
    this.changeDetector.detectChanges();
  }

  public onDropdownClick() {}
}

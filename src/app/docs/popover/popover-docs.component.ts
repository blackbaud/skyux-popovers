import {
  Component
} from '@angular/core';

@Component({
  selector: 'app-popover-docs',
  templateUrl: './popover-docs.component.html'
})
export class PopoverDocsComponent {

  public demoSettings: any = {};

  public get showAlignmentOptions(): boolean {
    const placement = this.demoSettings.skyPopoverPlacement;

    return (placement === 'above' || placement === 'below');
  }

  public onDemoSelectionChange(change: any): void {
    if (change.showTitle === true) {
      this.demoSettings.popoverTitle = 'Popover title';
    } else {
      this.demoSettings.popoverTitle = undefined;
    }

    if (change.alignment) {
      this.demoSettings.skyPopoverAlignment = change.alignment;
    }

    if (change.placement) {
      this.demoSettings.skyPopoverPlacement = change.placement;
    }
  }
}

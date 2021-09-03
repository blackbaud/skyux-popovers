import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Injector,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';

import {
  FormControl
} from '@angular/forms';

import {
  SkyThemeService,
  SkyThemeSettings
} from '@skyux/theme';

import {
  SkyPopoverContentComponent
} from '../../../../../popovers/src/modules/popover/popover-content.component'

import {
  SkyPopoverContext
} from '../../../../../popovers/src/modules/popover/popover-context'

import {
  SkyPopoverAlignment,
  SkyPopoverPlacement
} from '../../../../../popovers/src/public-api';

@Component({
  selector: 'popover-visual',
  templateUrl: './popover-visual.component.html',
  styleUrls: ['./popover-visual.component.scss']
})
export class PopoverVisualComponent implements AfterViewInit {

  @ViewChild('staticPopoversTarget', {
    read: ViewContainerRef
  })
  private staticPopoversTarget: ViewContainerRef;

  @ViewChild('staticDangerPopoversTarget', {
    read: ViewContainerRef
  })
  private staticDangerPopoversTarget: ViewContainerRef;

  @ViewChild('staticPopoverContentRef', { read: TemplateRef })
  private staticPopoverContentRef: TemplateRef<any>;

  public popoverType = new FormControl('info');

  constructor(
    private resolver: ComponentFactoryResolver,
    private elementRef: ElementRef,
    private injector: Injector,
    private themeSvc: SkyThemeService
  ) { }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.createStaticPopovers();
    });
  }

  public themeSettingsChange(themeSettings: SkyThemeSettings): void {
    this.themeSvc.setTheme(themeSettings);
  }

  /**
   * Creates "static" popover content for the visual tests only.
   */
  private createStaticPopovers(): void {
    const configs: {
      horizontalAlignment: SkyPopoverAlignment;
      placement: SkyPopoverPlacement,
      popoverTitle: string;
    }[] = [
      {
        horizontalAlignment: 'center',
        placement: 'above',
        popoverTitle: undefined
      },
      {
        horizontalAlignment: 'center',
        placement: 'below',
        popoverTitle: undefined
      },
      {
        horizontalAlignment: 'center',
        placement: 'right',
        popoverTitle: undefined
      },
      {
        horizontalAlignment: 'center',
        placement: 'left',
        popoverTitle: undefined
      },
      {
        horizontalAlignment: 'center',
        placement: 'above',
        popoverTitle: undefined
      },
      {
        horizontalAlignment: 'center',
        placement: 'above',
        popoverTitle: 'Did you know?'
      },
      {
        horizontalAlignment: 'center',
        placement: 'below',
        popoverTitle: 'Did you know?'
      },
      {
        horizontalAlignment: 'center',
        placement: 'right',
        popoverTitle: 'Did you know?'
      },
      {
        horizontalAlignment: 'center',
        placement: 'left',
        popoverTitle: 'Did you know?'
      }
    ];

    const injector = Injector.create({
      providers: [
        {
          provide: SkyPopoverContext,
          useValue: new SkyPopoverContext({
            contentTemplateRef: this.staticPopoverContentRef
          })
        }
      ],
      parent: this.injector
    });

    const factory = this.resolver.resolveComponentFactory(SkyPopoverContentComponent);

    configs.forEach((config) => {
      const componentRef = this.staticPopoversTarget.createComponent(factory, undefined, injector);

      componentRef.instance.open(this.elementRef, {
        dismissOnBlur: false,
        enableAnimations: false,
        horizontalAlignment: config.horizontalAlignment,
        isStatic: true,
        placement: config.placement,
        popoverTitle: config.popoverTitle
      });
    });

    configs.forEach((config) => {
      const componentRef = this.staticDangerPopoversTarget.createComponent(factory, undefined, injector);

      componentRef.instance.open(this.elementRef, {
        dismissOnBlur: false,
        enableAnimations: false,
        horizontalAlignment: config.horizontalAlignment,
        isStatic: true,
        placement: config.placement,
        popoverTitle: config.popoverTitle,
        popoverType: 'danger'
      });
    });
  }

}

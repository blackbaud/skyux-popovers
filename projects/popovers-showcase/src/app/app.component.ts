import {
  Component
} from '@angular/core';

import {
  SkyAppStyleLoader
} from '@skyux/theme';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'popovers-showcase';
  public isLoaded = false;

  constructor(
    styleLoader: SkyAppStyleLoader
  ) {
    styleLoader.loadStyles().then(() => {
      this.isLoaded = true;
    });
  }
}

import { enableProdMode, NgModuleRef, NgModule } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { BootController } from './boot-control';

if (environment.production) {
  enableProdMode();
}
import 'zone.js'; // Added for lazy module error in firefox,safari in server.

const init = () => {
  platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => (window as any).appBootstrap && (window as any).appBootstrap())
  .catch(err => console.error('NG Bootstrap Error =>', err));
}

// Init on first load
init();

// Init on reboot request
const boot = BootController.getbootControl().watchReboot().subscribe(() => init());

# Experimental server inside browser inspired by Mafintosh https://github.com/mafintosh/browser-server


#### Install
```bash
npm i @rxdi/browser-server -g
```


#### Load BrowserServerModule

```typescript
import { BootstrapFramework } from '@rxdi/core';
import { AppModule } from './app/app.module';
import { BrowserServerModule } from '@rxdi/browser-server';
import { Worker } from './worker';

BootstrapFramework(AppModule, [
    BrowserServerModule.forRoot({ path: '/worker.js' }),
])
    .subscribe(
        () => console.log('App Started!'),
        (err) => console.error(err)
    );
```


#### Define Worker
import { Module, ModuleWithServices } from "@rxdi/core";
import { BrowserServer } from "./browser-server.service";
import { WebWorkerConfig } from "./web-worker-config";
import { Worker } from './worker';

@Module()
export class BrowserServerModule {
    public static forRoot(config?: WebWorkerConfig): ModuleWithServices {
        return {
            module: BrowserServerModule,
            services: [
                Worker,
                BrowserServer,
                {
                    provide: WebWorkerConfig,
                    useValue: config || new WebWorkerConfig
                },
                {
                    provide: 'ready',
                    deps: [BrowserServer],
                    lazy: true,
                    useFactory: (server: BrowserServer) => new Promise(r => server.on('ready', async () => r()))
                },
            ]
        }
    }
}

export * from './browser-server.service';
export * from './web-worker-config';
export * from './worker';

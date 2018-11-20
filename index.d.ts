import { ModuleWithServices } from "@rxdi/core";
import { WebWorkerConfig } from "./web-worker-config";
export declare class BrowserServerModule {
    static forRoot(config?: WebWorkerConfig): ModuleWithServices;
}
export * from './browser-server.service';
export * from './web-worker-config';
export * from './worker';

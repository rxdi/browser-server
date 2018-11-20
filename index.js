var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var BrowserServerModule_1;
import { Module } from "@rxdi/core";
import { BrowserServer } from "./browser-server.service";
import { WebWorkerConfig } from "./web-worker-config";
import { Worker } from './worker';
let BrowserServerModule = BrowserServerModule_1 = class BrowserServerModule {
    static forRoot(config) {
        return {
            module: BrowserServerModule_1,
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
                    useFactory: (server) => new Promise(r => server.on('ready', () => __awaiter(this, void 0, void 0, function* () { return r(); })))
                },
            ]
        };
    }
};
BrowserServerModule = BrowserServerModule_1 = __decorate([
    Module()
], BrowserServerModule);
export { BrowserServerModule };
export * from './browser-server.service';
export * from './web-worker-config';
export * from './worker';

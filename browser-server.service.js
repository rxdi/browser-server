var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EventEmitter } from 'events';
import stream from 'readable-stream';
import { Service } from '@rxdi/core';
import { WebWorkerConfig } from './web-worker-config';
import { Subject, BehaviorSubject } from 'rxjs';
let BrowserServer = class BrowserServer extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.streams = [];
        this.onReady = new Subject();
        this.onRequest = new BehaviorSubject({});
    }
    OnInit() {
        if (navigator.serviceWorker) {
            this.register();
        }
    }
    onopen(message) {
        const ws = new stream.Writable();
        const headers = {};
        let first = true;
        ws._callback = null;
        ws._pending = null;
        ws._wants = false;
        ws.statusCode = 200;
        ws.setHeader = (name, val) => headers[name] = val;
        ws.getHeader = (name, val) => headers[name];
        ws.on('finish', () => ws._write(null, null, () => { }));
        ws._write = (data, enc, cb) => {
            if (first) {
                first = false;
                navigator.serviceWorker.controller.postMessage({
                    id: message.data.id,
                    status: ws.statusCode,
                    statusText: status[ws.statusCode],
                    headers
                });
            }
            if (ws._wants) {
                ws._wants = false;
                navigator.serviceWorker.controller.postMessage({ id: message.data.id, data: data });
                cb();
                return;
            }
            ws._pending = data;
            ws._callback = cb;
        };
        this.streams[message.data.id] = ws;
        setTimeout(() => {
            this.emit('request', message.data, ws);
            this.onRequest.next({ req: message.data, res: ws });
        }, 2000);
    }
    register() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            navigator.serviceWorker.addEventListener('message', (m) => {
                const message = m;
                debugger;
                const id = message.data.id;
                if (message.data.type === 'open') {
                    self.onopen(message);
                    return;
                }
                const ws = self.streams[id];
                if (ws._callback) {
                    const data = ws._pending;
                    const cb = ws._callback;
                    ws._pending = ws._callback = null;
                    navigator.serviceWorker.controller.postMessage({ id, data });
                    cb();
                    return;
                }
                ws._wants = true;
            });
            yield navigator.serviceWorker.register(this.config.path);
            this.emit('ready');
            this.onReady.next(true);
        });
    }
};
BrowserServer = __decorate([
    Service(),
    __metadata("design:paramtypes", [WebWorkerConfig])
], BrowserServer);
export { BrowserServer };

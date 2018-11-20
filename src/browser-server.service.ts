import { EventEmitter } from 'events';
import stream from 'readable-stream';
import { Service } from '@rxdi/core';
import { WebWorkerConfig } from './web-worker-config';
import { Subject, BehaviorSubject } from 'rxjs';

interface Writable {
    _callback: () => void;
    _pending: any;
    _wants: boolean;
    statusCode: number;
    setHeader(name, val): Headers;
    getHeader(name, val): any;
    on(event: 'finish', callback: any);
    _write(data, encoding, callback: () => void);
}

@Service()
export class BrowserServer extends EventEmitter {

    streams: Writable[] = [];
    onReady: Subject<boolean> = new Subject();
    onRequest: BehaviorSubject<any> = new BehaviorSubject({});

    constructor(
        private config?: WebWorkerConfig
    ) {
        super();
    }

    OnInit() {
        if (navigator.serviceWorker) {
            this.register();
        }
    }

    onopen(message) {
        const ws: Writable = new stream.Writable()
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
        }

        this.streams[message.data.id] = ws;
        setTimeout(() => {
            this.emit('request', message.data, ws);
            this.onRequest.next({ req: message.data, res: ws });
        }, 2000);
    }

    async register() {
        const self = this;
        navigator.serviceWorker.addEventListener('message', (m) => {
            const message = m;
            debugger
            const id: number = message.data.id;
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
        await navigator.serviceWorker.register(this.config.path);
        this.emit('ready');
        this.onReady.next(true);
    }
}

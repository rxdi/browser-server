import { EventEmitter } from 'events';
import { WebWorkerConfig } from './web-worker-config';
import { Subject, BehaviorSubject } from 'rxjs';
interface Writable {
    _callback: () => void;
    _pending: any;
    _wants: boolean;
    statusCode: number;
    setHeader(name: any, val: any): Headers;
    getHeader(name: any, val: any): any;
    on(event: 'finish', callback: any): any;
    _write(data: any, encoding: any, callback: () => void): any;
}
export declare class BrowserServer extends EventEmitter {
    private config?;
    streams: Writable[];
    onReady: Subject<boolean>;
    onRequest: BehaviorSubject<any>;
    constructor(config?: WebWorkerConfig);
    OnInit(): void;
    onopen(message: any): void;
    register(): Promise<void>;
}
export {};

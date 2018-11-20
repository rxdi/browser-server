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
import { Service } from "@rxdi/core";
let Worker = class Worker {
    constructor() {
        this.prefix = '/aaa/';
        this.streams = [];
    }
    OnInit() {
        const self = this;
        window.addEventListener('message', function (e) {
            if (e.data.id === -1 && e.data.prefix) {
                self.prefix = e.data.prefix;
                return;
            }
            const s = self.streams[e.data.id];
            if (s.started)
                s.ondata(e.data);
            else
                s.onstart(e.data);
        });
        window.addEventListener('fetch', (e) => __awaiter(this, void 0, void 0, function* () {
            const path = '/' + e.request.url.split('/').slice(3).join('/');
            if (path.indexOf(self.prefix) !== 0) {
                return;
            }
            const headers = {};
            e.request.headers.forEach((val, name) => headers[name] = val);
            const client = yield window['clients'].get(e.clientId);
            if (!client) {
                return e.respondWith(fetch(e.request));
            }
            return e.respondWith(new Promise((resolve, reject) => {
                let pulling = false;
                let controller;
                // const encoder = new TextEncoder()
                let rs;
                let id = self.streams.indexOf(null);
                if (id === -1) {
                    id = self.streams.push(null) - 1;
                }
                const req = {
                    id,
                    started: false,
                    onstart: (data) => {
                        if (data.skip) {
                            self.streams[id] = null;
                            resolve(fetch(e.request));
                            return;
                        }
                        const Readable = ReadableStream;
                        req.started = true;
                        rs = new Readable({
                            pull: function (c) {
                                if (pulling)
                                    return;
                                pulling = true;
                                controller = c;
                                client.postMessage({
                                    type: 'pull',
                                    id: id
                                });
                            },
                            cancel: () => {
                                console.log('was cancelled');
                            }
                        });
                        resolve(new Response(rs, { status: data.status, headers: data.headers, statusText: data.statusText }));
                    },
                    ondata: ({ data }) => {
                        pulling = false;
                        if (!data) {
                            controller.close();
                            self.streams[id] = null;
                            return;
                        }
                        controller.enqueue(data);
                    },
                    onerror: () => {
                        self.streams[id] = null;
                        if (rs) {
                            return rs.cancel();
                        }
                        return reject(new Error('Request failed'));
                    }
                };
                self.streams[id] = req;
                client.postMessage({
                    type: 'open',
                    id: id,
                    path: path,
                    headers
                });
            }));
        }));
        window.addEventListener('install', (event) => {
            event['waitUntil'](window['skipWaiting']());
        });
        window.addEventListener('activate', (event) => {
            event['waitUntil'](window['clients'].claim());
        });
    }
};
Worker = __decorate([
    Service()
], Worker);
export { Worker };

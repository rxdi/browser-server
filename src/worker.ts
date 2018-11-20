import { Service, OnInit } from "@rxdi/core";

@Service()
export class Worker implements OnInit {
  prefix: string = '/aaa/';
  streams = [];

  OnInit() {
    const self = this;
    window.addEventListener('message', function (e) {
      if (e.data.id === -1 && e.data.prefix) {
        self.prefix = e.data.prefix
        return
      }

      const s = self.streams[e.data.id]
      if (s.started) s.ondata(e.data)
      else s.onstart(e.data)
    })

    window.addEventListener('fetch', async (e: any) => {
      const path = '/' + e.request.url.split('/').slice(3).join('/')
      if (path.indexOf(self.prefix) !== 0) {
        return;
      }

      const headers = {}

      e.request.headers.forEach((val, name) => headers[name] = val)

      const client = await window['clients'].get(e.clientId)
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
              self.streams[id] = null
              resolve(fetch(e.request))
              return
            }
            const Readable: any = ReadableStream;
            req.started = true
            rs = new Readable({
              pull: function (c) {
                if (pulling) return
                pulling = true
                controller = c
                client.postMessage({
                  type: 'pull',
                  id: id
                })
              },
              cancel: () => {
                console.log('was cancelled')
              }
            });
            resolve(new Response(rs, { status: data.status, headers: data.headers, statusText: data.statusText }));
          },
          ondata: ({ data }) => {
            pulling = false;
            if (!data) {
              controller.close()
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
        }

        self.streams[id] = req;
        client.postMessage({
          type: 'open',
          id: id,
          path: path,
          headers
        });
      }))
    });

    window.addEventListener('install', (event) => {
      event['waitUntil'](window['skipWaiting']());
    });

    window.addEventListener('activate', (event) => {
      event['waitUntil'](window['clients'].claim());
    });
  }

}

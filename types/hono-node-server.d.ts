declare module 'hono/node-server' {
  type ServeOptions = {
    fetch: any;
    port?: number;
  };
  export function serve(opts: ServeOptions): void;
}

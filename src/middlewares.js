import Koa from 'koa';

/**
 *
 * @param {string} key
 * @returns {(ctx: Koa.Context, next: () => Promise<any>) => void}
 */
export function send(key) {
  return async (ctx, next) => {
    ctx.body = ctx.state[key];
    await next();
  }
}

/**
 *
 * @param {{ key: string, value: any, nullHandling?: (ctx?: Koa.Context) => void }} ctx
 * @returns {(ctx: Koa.Context, next: () => Promise<any>) => void}
 */
export function store({ key, value, nullHandling }) {
  return async (ctx, next) => {
    let val;
    if (value instanceof Function) {
      val = await Promise.resolve(value(ctx));
    } else {
      val = value;
    }
    if (val === null && nullHandling) {
      nullHandling(ctx);
      await next();
    } else {
      ctx.state[key] = val;
      await next();
      delete ctx.state[key];
    }
  };
}

import Koa from 'koa';

import * as db from './db.js';

/**
 *
 * @param {Koa.Context} ctx
 * @returns {Promise<any>}
 */
export async function fetchGame(ctx) {
  return await db.queryGameByID(ctx.state.id);
}

/**
 *
 * @param {Koa.Context} ctx
 * @returns {string}
 */
export function fetchID(ctx) {
  return ctx.params.id;
}

export const fetchAllGames = db.queryAllGameJSONs;

import Koa from 'koa';
import Router from 'koa-router';
import { store, send } from './middlewares.js';
import * as updater from './updater.js';
import * as parsers from './parsers.js';

// KOA
const app = new Koa();

const route = new Router();

route.get('/', store({
  key: 'games',
  value: 'hello world',
}), send('games'));

route.get('/api/games', store({
  key: 'games',
  value: parsers.fetchAllGames,
}), send('games'));

route.get('/api/games/:id', store({
  key: 'id',
  value: parsers.fetchID,
}), store({
  key: 'game',
  value: parsers.fetchGame,
  nullHandling: (ctx) => ctx.throw(404, 'game information not found')
}), send('game'));

route.post('/api/games/:id', store({
  key: 'id',
  value: parsers.fetchID,
}), (ctx, next) => {
  return updater.updateByID(ctx.state.id)
    .then(() => {
      ctx.body = 'success';
    }).catch((error) => {
      console.error(error);
      ctx.throw(400, 'fail');
    }).finally(next);
});

app.use(route.routes());
app.use(route.allowedMethods());

app.on("error", (err) => {
  console.log(new Date(), ":", err);
});

export default app;
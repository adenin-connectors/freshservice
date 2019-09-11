'use strict';

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const decache = require('decache');

global.logger = require('@adenin/cf-logger');

const app = new Koa();
const router = new Router();

const PORT = process.env.PORT || 4000;

let index = require('./index');

router
  .post('/:activity', async (ctx) => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Decaching...');

      decache('./index');
      index = require('./index');
    }

    await index.activities(ctx);
  })
  .all('/:activity', async (ctx) => {
    const err = new Error('Method not allowed');
    err.status = 405;

    ctx.app.emit('error', err, ctx);
  })
  .all('/', async (ctx) => {
    const err = new Error('Not found');
    err.status = 404;

    ctx.app.emit('error', err, ctx);
  });

app
  .use(async (ctx, next) => {
    try {
      process.env.HOST = ctx.req.headers.host;
      await next();
    } catch (err) {
      ctx.app.emit('error', err, ctx);
    }
  })
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .on('error', (err, ctx) => {
    logger.error(err);

    ctx.status = err.status || 500;
    ctx.body = {
      Response: {
        ErrorCode: ctx.status,
        Data: {
          ErrorText: err.message
        }
      }
    };
  })
  .listen(PORT);

logger.info('Server running on port ' + PORT);

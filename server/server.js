// app.use(serve(`${__dirname}/public`))
// app.use(require('koa-static')(root, opts));
const serve = require('koa-static');
const _ = require('lodash');
const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const myMod = require('./random-emoji')
router = new Router();

setupLogging();


router.get('/hi', (ctx, next) => {
  ctx.body = 'Hello World!';
});


router.get('/emoji', (ctx, next) => {
  randomEmoj = myMod();
  ctx.body = randomEmoj;
});

app.use(router.routes()).use(router.allowedMethods());

app.use(serve('./public'));

app.listen(3000);
console.log("now listening localhost:3000")






function setupLogging(){
  //Init request
  app.use(async (ctx, next) => {
    console.log("\n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
    await next();
  });
  // x-response-time
  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
  });
  // logger
  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - TimeTaken:${ms}`);
  });

  app.use(async (ctx, next) => {
    await next();
    console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- \n")
  });
}

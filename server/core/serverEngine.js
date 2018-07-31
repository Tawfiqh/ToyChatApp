const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');

const app = new Koa();

function setup(port){
  router = new Router();


  setupLogging();
  enableCors();
  setupStaticRoutes();

  var server = app.listen({ port: port }, () => {
    console.log(`Server ready at localhost:${port}`);
  });



  function setupLogging(){
    // logger
    app.use(async (ctx, next) => {
      console.log("\n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
      console.log(`>>>${ctx.method} ${ctx.url} start ⏰ \n`);
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      console.log(`\n>>> ${ctx.method} ${ctx.url} --- TimeTaken:${ms}`);
      console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
    });

  }


  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  // Setup Functions
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-


  function enableCors(){
    app.use(async (ctx, next) => {
      ctx.set('Access-Control-Allow-Origin', "http://localhost:8080");
      ctx.set('Access-Control-Allow-Credentials', 'true');
      await next();
    });
  }


  function setupStaticRoutes(){

    router.get('/hi', (ctx, next) => {
      ctx.body = 'Hello World!';
    });

    app.use(router.routes()).use(router.allowedMethods());

    router.redirect('/chat', '/chat.html');
    app.use(serve('./public'));
    app.use(serve('./basic-client'));

  }

  return {server, router};
}

function setupGraphServerOnPath(apollo, path = '/graph'){
  apollo.applyMiddleware({ app, path });
}


module.exports = {
  setup,
  setupGraphServerOnPath
}

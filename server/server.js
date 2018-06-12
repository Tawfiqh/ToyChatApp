const serve = require('koa-static');
const _ = require('lodash');
const Koa = require('koa');
const Router = require('koa-router');
const randomEmoji = require('./random-emoji')
const socket = require('socket.io');


router = new Router();
const app = new Koa();

setupLogging();

router.get('/hi', (ctx, next) => {
  ctx.body = 'Hello World!';
});

router.get('/emoji', (ctx, next) => {
  ctx.body = randomEmoji();
});

app.use(router.routes()).use(router.allowedMethods());

router.redirect('/chat', '/chat.html');

app.use(serve('./public'));
app.use(serve('./basic-client'));

var server = app.listen(3000);
console.log("now listening localhost:3000")


const io = new socket(server)
setupIoChatServer();




function setupLogging(){
  //Init request
  // app.use(async (ctx, next) => {
  //   console.log("\n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
  //   await next();
  // });
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
    console.log("-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-")
  });
}




function setupIoChatServer(){
  io.on('connection', function(socket){
    console.log('a user connected')

    socket.on('join', function(data) {
  		console.log(data);
  	});

    socket.on('messages', function(data){
      console.log("Recieved: " + data)

      socket.emit('cppp', data);
  		socket.broadcast.emit('cppp', data);
  	});
  })
}

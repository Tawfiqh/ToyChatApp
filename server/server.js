const serve = require('koa-static');
const _ = require('lodash');
const Koa = require('koa');
const Router = require('koa-router');
const randomEmoji = require('./random-emoji')
const randomWords = require('./random-words/random-words')
const socket = require('socket.io');


router = new Router();
const app = new Koa();

setupLogging();
enableCors();

router.get('/hi', (ctx, next) => {
  ctx.body = 'Hello World!';
});

router.get('/emoji', (ctx, next) => {
  ctx.body = randomEmoji();
});

router.get('/new-user-id', async (ctx, next) => {
  var newId = await randomWords();
  newId = newId.replace(/[\s-]/g, "_"); // Replace white spaces and dahes with underscore.
  newId = randomEmoji() + newId + randomEmoji() ;
  console.log("newId:" + newId);
  ctx.body = newId
});

app.use(router.routes()).use(router.allowedMethods());

router.redirect('/chat', '/chat.html');

app.use(serve('./public'));
app.use(serve('./basic-client'));

var server = app.listen(3000);
console.log("now listening localhost:3000")


const io = new socket(server)
setupIoChatServer();


function enableCors(){
  app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', "http://localhost:8080");
    ctx.set('Access-Control-Allow-Credentials', 'true');
    await next();
  });
}

function setupLogging(){
  //Init request
  // x-response-time
  // app.use(async (ctx, next) => {
  //   const start = Date.now();
  //   await next();
  //   const ms = Date.now() - start;
  //   ctx.set('X-Response-Time', `${ms}ms`);
  // });
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




function setupIoChatServer(){
  var recentMessages =[];
  var recentMessagesBufferSize = 10;
  io.on('connection', function(socket){
    console.log('a user connected')

    socket.on('join', function(data) {
  		console.log(data);
      recentMessages.forEach((x) => {
          socket.emit('newMessage', x); //Only sends to sender
        }
      );
      console.log("end of contenc")

  	});

    socket.on('messages', function(data){
      console.log("Recieved: " + JSON.stringify(data))
      recentMessages.push(data);


      if (recentMessages.length > recentMessagesBufferSize){
        recentMessages = _.takeRight(recentMessages, recentMessagesBufferSize)
      }

      io.sockets.emit('newMessage', data); //Sends to everyone
      // socket.emit('newMessage', data); //Only sends to sender
  		// socket.broadcast.emit('newMessage', data); // doesn't send to sender.
  	});
  })
}

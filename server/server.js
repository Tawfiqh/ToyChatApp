const serve = require('koa-static');
const _ = require('lodash');
const Koa = require('koa');
const Router = require('koa-router');
const randomEmoji = require('./random-emoji')
const randomWords = require('./random-words/random-words')
const socket = require('socket.io');
const { ApolloServer, gql } = require('apollo-server-koa');

var users = [
  new User("Tim", 34),
  new User("Terrence", 31),
  new User("Alan", 23),
];

var messages = [];

var chats = [];


function graphQlSetup(){
  const schema = gql`
    type Query { # define the query
      hello: String # define the fields
      byeBye: String
      getUsers: [User]
      getUsersAboveAge(age: Int!): [User]
      rollDice(numDice: Int!, numSides: Int): [Int]
    }

    type User { # define the type
      name: String
      age: Int
    }
  `;

  class User {
    constructor(name,age) {
      this.name = name
      this.age = age
    }
  }


  // Resolvers define the technique for fetching the types in the
  // schema.  We'll retrieve books from the "books" array above.
  const resolvers = {
    Query:{
      hello: ()  => "World",
      byeBye: ()  => "👋 ",
      getUsers: () => users,
      getUsersAboveAge: (result, {age}) => {
        return users.filter(a => a.age > age)
      },

    }
  };

  return new ApolloServer(
   {
     typeDefs: schema,
     resolvers,
     formatError: (err) => { console.log(err); return err }
   }
  );


};


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

router.get('/status', (ctx, next) => {

  var clients = [];

  for(var client in io.engine.clients){

    var clientToAdd = _.pick(io.engine.clients[client],["id", "readyState", "remoteAddress"] )
    clients.push(clientToAdd);

  }

  var result = {
    peopleConnected: io.engine.clientsCount,
    clients: clients,
    messageBuffer: recentMessages,
  };

  var prettyResult = JSON.stringify(result, null, 2);
  ctx.body = prettyResult;
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


const apolloserver = graphQlSetup();

apolloserver.applyMiddleware({ app, path:'/graph' });


var server = app.listen({ port: 3000 }, (url) => {
  console.log(`Server ready at :3000`);
  console.log(`📈 🚀  Server ready at :3000${apolloserver.graphqlPath}`);
});



const io = new socket(server)
var recentMessages =[];
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
  var recentMessagesBufferSize = 10;
  io.on('connection', function(socket){
    console.log('a user connected')

    socket.on('join', function(data) {
  		console.log(data);
      recentMessages.forEach((x) => {
          socket.emit('newMessage', x); //Only sends to sender
        }
      );
  	});

    socket.on('messages', function(data){
      console.log("Recieved: " + JSON.stringify(data))
      recentMessages.push(data);


      if (recentMessages.length > recentMessagesBufferSize){
        recentMessages = _.takeRight(recentMessages, recentMessagesBufferSize)
      }

      io.sockets.emit('newMessage', data); //Sends to everyone
      // socket.emit('newMessage', data); //Only sends to sender
  		// socket.broadcast.emit('newMessage', data); // sends to everyone apart from sender.
  	});
  })
}

const serve = require('koa-static');
const _ = require('lodash');
const Koa = require('koa');
const Router = require('koa-router');
const randomEmoji = require('./random-emoji')
const randomWords = require('./random-words/random-words')
const socket = require('socket.io');

const { ApolloServer, gql } = require('apollo-server');




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

const users = [
  new User("Tim", 34),
  new User("Terrence", 31),
  new User("Alan", 23),
];

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


// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const apolloServer = new ApolloServer(
  {
    typeDefs: schema,
    resolvers,
    formatError: (err) => { console.log(err); return err }
  });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
apolloServer.listen({
  host: 'localhost',
  port: 4000,
  exclusive: true
}).then(({url}) => {
  console.log(`🚀  Server ready at ${url}`);
});

apolloServer.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});



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

var server = app.listen(3000);
console.log("now listening localhost:3000")


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

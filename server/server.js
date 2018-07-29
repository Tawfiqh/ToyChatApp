const { ApolloServer, gql } = require('apollo-server-koa');

const Koa = require('koa');
// const { PubSub, withFilter } = require('graphql-subscriptions');
const { SubscriptionClient, addGraphQLSubscriptions } = require('subscriptions-transport-ws');


const serve = require('koa-static');
const _ = require('lodash');

const Router = require('koa-router');
const socket = require('socket.io');
const sqlite3 = require('sqlite3');

const randomEmoji = require('./random-emoji')
const randomWords = require('./random-words/random-words')

// const pubsub = new PubSub();
const app = new Koa();


// var messages = [];
//
// var chats = [];
//
// const channels = [{
//   id: '1',
//   name: 'soccer',
//   messages: [{
//     id: '1',
//     text: 'soccer is football',
//   }, {
//     id: '2',
//     text: 'hello soccer world cup',
//   },
//  {
//     id: '3',
//     text: 'Tawfiq here',
//   }]
// }, {
//   id: '2',
//   name: 'baseball',
//   messages: [{
//     id: '3',
//     text: 'baseball is life',
//   }, {
//     id: '4',
//     text: 'hello baseball world series',
//   }]
// },
// {
//   id: '3',
//   name: "tawfiq test",
//   messages:[
//     {
//       id: '1',
//       text: 'hello baseball world series'
//     }
//   ]
//
// }];
// let nextId = 3;
// let nextMessageId = 5;



router = new Router();

var db = null;

function db_start(){
  db = new sqlite3.Database('chatDatabase.sqlite3');
};

setupDb();
setupLogging();
enableCors();
setupOtherEndpoints();
graphQlSetup();





var port = 4000;

var server = app.listen({ port: port }, () => {
  console.log(`Server ready at localhost:${port}`);
});





// Needs to happen after starting the server (I think)
const io = new socket(server)
var recentMessages =[];
setupIoChatServer();




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

function setupOtherEndpoints(){

  router.get('/hi', (ctx, next) => {
    ctx.body = 'Hello World!';
  });

  router.get('/emoji', (ctx, next) => {
   ctx.body = randomEmoji();
  });

  router.get('/status', (ctx, next) => {
    ctx.body = calculateServerStatus();
  });

  router.get('/new-user-id', async (ctx, next) => {
    ctx.body = await formatNewUserId();
  });


  app.use(router.routes()).use(router.allowedMethods());

  router.redirect('/chat', '/chat.html');
  app.use(serve('./public'));
  app.use(serve('./basic-client'));


}



// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Logging
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

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
// Chat
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-


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

      db_start()
      const insertData = `'${data["message"]}', '${data["sender"]}', strftime('%Y-%m-%d %H:%M:%S:%f','now')`;

      let sql = `INSERT INTO messages(body, userId,timestamp) VALUES (${insertData})`;
      console.log("sql:" + sql);
      db.all(sql, [], (err, rows) => {
        if (err) {
          throw err;
        }
        rows.forEach((row) => {
          console.log(row.name);
        });
      });

      // close the database connection
      db.close();

      if (recentMessages.length > recentMessagesBufferSize){
        recentMessages = _.takeRight(recentMessages, recentMessagesBufferSize)
      }

      io.sockets.emit('newMessage', data); //Sends to everyone
      // socket.emit('newMessage', data); //Only sends to sender
  		// socket.broadcast.emit('newMessage', data); // sends to everyone apart from sender.
  	});
  })
}

async function formatNewUserId(){
  var newId = await randomWords();
  newId = newId.replace(/[\s-]/g, "_"); // Replace white spaces and dahes with underscore.
  newId = randomEmoji() + newId + randomEmoji() ;
  console.log("newId:" + newId);

  return newId;

}


function calculateServerStatus(){
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
  return prettyResult;
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Graph QL - Setup.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-


function graphQlSetup(){

  class User {
    constructor(name,age) {
      this.name = name
      this.age = age
    }
  }

  var users = [
    new User("Tim", 34),
    new User("Terrence", 31),
    new User("Alan", 23),
  ];

  var messages = [];

  var chats = [];

  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  const schema = gql`
    type Query { # define the query
      hello: String # define the fields
      byeBye: String
      Users: [User]
      getUsersAboveAge(age: Int!): [User]
      messages(limit: Int): [Messagex]
      newUser: User
      channels: [Channel]    # "[]" means this is a list of channels
      channel(id: ID!): Channel
    }
    type Channel {
      id: ID!                # "!" denotes a required field
      name: String
      messages: [Message]!
    }

    input MessageInput{
      channelId: ID!
      text: String
    }

    type Message {
      id: ID!
      text: String
    }

    type Mutation {
      sendMessage(message: MessageInputx): Messagex
      addChannel(name: String!): Channel
      addMessage(message: MessageInput!): Message
    }

    input MessageInputx{
      body: String
      sender: String
    }

    type Messagex{
      timestamp: String
      body: String
      sender: String
    }

    type User { # define the type
      name: String
      timestamp: Int
      age: Int
    }

    type Subscription {
      messageAdded(channelId: ID!): Message
    }
  `;


  // Resolvers define the technique for fetching the types in the
  // schema.  We'll retrieve books from the "books" array above.
  const resolvers = {
    Query:{
      hello: ()  => "World",
      byeBye: ()  => "👋 ",
      Users: () => users,
      getUsersAboveAge: (result, {age}) => {
        console.log("Age: "+ age);

        return users.filter(a => a.age > age)
      },
      messages: (result, {limit}) => {

        if (!limit){
          console.log("NoLimit: "+limit);
          limit = 10;
        } else{
          console.log("Limit: "+limit);
        }

        return new Promise( function(resolve, reject){

          db_start();

          results = [];

          let sql = `SELECT timestamp, body, userId FROM messages ORDER by timestamp DESC LIMIT ${limit};`;
          // console.log("sql:" + sql);
          db.all(sql, [], (err, rows) => {
            if (err) {
              console.log("naaaah");
              reject(err);
            }

            rows.forEach((row) => {
              results.push({
                body: row["body"],
                sender: row["userId"],
                timestamp: row["timestamp"],
              });

              // console.log(row);

            });

            resolve(results);
          });

          // close the database connection
          db.close();
        });

      },
      newUser: async () => {
        var name = await formatNewUserId();
        return new User(name, 99);
      },
      channels: () => {
        return channels;
      },
      channel: (root, { id }) => {
        return channels.find(channel => channel.id === id);
      },
    },
    Mutation: {
      sendMessage : (result, {message}) => {

        console.log("Sender:" + JSON.stringify(message["sender"]));
        console.log("Body:" + JSON.stringify(message["body"]));


        db_start()
        const insertData = `'${message["body"]}', '${message["sender"]}', strftime('%Y-%m-%d %H:%M:%S:%f','now')`;
        let sql = `INSERT INTO messages(body, userId,timestamp) VALUES (${insertData})`;

        db.all(sql, [], (err, rows) => {
          if (err) {
            throw err;
          }
          rows.forEach((row) => {
            console.log(row.name);
          });
        });

        // close the database connection
        db.close();

        return { body: message["body"], sender: message["sender"] };

      },
      addChannel: (root, args) => {
        const newChannel = { id: String(nextId++), messages: [], name: args.name };
        channels.push(newChannel);
        return newChannel;
      },
      addMessage: (root, { message }) => {
        const channel = channels.find(channel => channel.id === message.channelId);
        if(!channel)
          throw new Error("Channel does not exist");

        const newMessage = { id: String(nextMessageId++), text: message.text };
        channel.messages.push(newMessage);

        console.log("pblishing the good news");

        pubsub.publish('messageAdded', { messageAdded: newMessage, channelId: message.channelId });

        return newMessage;
      },
    },
    Subscription: {
      messageAdded: {
        subscribe: () => pubsub.asyncIterator('messageAdded')
      }
    }
  };

  const apolloserver =  new ApolloServer(
   {
     typeDefs: schema,
     resolvers,
     formatError: (err) => { console.log(err); return err },
     context: ({ ctx }) => ctx,
     subscriptions: {
      onConnect: (connectionParams, webSocket) => {
        console.log(connectionParams);
        // if (connectionParams.authToken) {
        //   return validateToken(connectionParams.authToken)
        //     .then(findUser(connectionParams.authToken))
        //     .then(user => {
        //       return {
        //         currentUser: user,
        //       };
        //     });
        // }
        //
        // throw new Error('Missing auth token!');
      },
     },
   }
  );


  apolloserver.applyMiddleware({ app, path:'/graphql' });


  // Subscription listener for
  // const http = require('http');
  // const PORT = port + 1000;
  //
  // const httpServer = http.createServer(app.callback());
  // apolloserver.installSubscriptionHandlers(httpServer);
  //
  // // We are calling `listen` on the http server variable, and not on `app`.
  // httpServer.listen(PORT, () => {
  //   console.log(`🚀 Server ready at http://localhost:${PORT}${apolloserver.graphqlPath}`)
  //   console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${apolloserver.subscriptionsPath}`)
  // })




};


function setupDb(){
  db_start();

  db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS messages (body TEXT, userId TEXT, timestamp TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS users (userId TEXT, sender Int, timestamp TEXT)");
    // db.run("CREATE TABLE IF NOT EXISTS chats (userId TEXT, sender Int, timestamp DATETIME(6))");
  });

  db.close();

}

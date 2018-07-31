require('dotenv').load();

const { ApolloServer, gql } = require('apollo-server-koa');


const _ = require('lodash');

const socket = require('socket.io');

const randomEmoji = require('./random-emoji')
const serverEngine = require('./core/serverEngine')
const Users = require('./models/Users.js');
const Messages = require('./models/Messages.js');
const Database = require('./core/db.js');

var db = new Database(process.env.DATABASE);

var port = 4000;

graphQlSetup();

var {server, router} = serverEngine.setup(port);

setupOtherEndpoints(router);

// Needs to run after starting the server (I think)
const io = new socket(server)

setupIoChatServer();







// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Chat
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function setupOtherEndpoints(router){

    router.get('/emoji', (ctx, next) => {
     ctx.body = randomEmoji();
    });

    router.get('/status', (ctx, next) => {
      ctx.body = calculateServerStatus();
    });

    router.get('/new-user-id', async (ctx, next) => {
      ctx.body = await Users.newUserId();
    });

}

function setupIoChatServer(){

  io.on('connection', function(socket){
    console.log('a user connected')

    socket.on('join', function(data) {
  		console.log(data);
  	});

    socket.on('messages', function(data){
      console.log("Recieved: " + JSON.stringify(data))

      io.sockets.emit('newMessage', data); //Sends to everyone
      // socket.emit('newMessage', data); //Only sends to sender
  		// socket.broadcast.emit('newMessage', data); // sends to everyone apart from sender.
  	});

  })
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
  };

  var prettyResult = JSON.stringify(result, null, 2);
  return prettyResult;
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Graph QL - Setup.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-


function graphQlSetup(){

  const schema = gql`
    type Query { # define the query
      hello: String # define the fields
      byeBye: String
      users: [User]
      messages(limit: Int): [Message]
      newUser: User
    }

    type Mutation {
      sendMessage(message: MessageInput): Message
      addUser(userName: String):User
    }


    type Subscription {
      messageAdded: Message
    }

    input MessageInput{
      body: String
      sender: String
    }

    type Message{
      timestamp: String
      body: String
      sender: User
    }

    type User { # define the type
      name: String
      timestamp: String
      id: Int
      messages: [Message]
    }
  `;


  // Resolvers define the technique for fetching the types in the
  // schema.  We'll retrieve books from the "books" array above.
  const resolvers = {
    Query:{
      hello: ()  => "World",
      byeBye: ()  => "👋 ",
      users: (result, {limit}) => {
        return Users.getUsers(limit);
      },
      messages: (result, {limit}) => {
        return Messages.getMessages(limit);
      },
      newUser: async () => {
        var name = await Users.newUserId();
        return {name:name};
      },
    },
    Mutation: {
      sendMessage: async (result, {message}) => {

        var result = await Messages.sendMessage(message)

        io.sockets.emit('newMessage', result); //Sends to everyone

        return result;

      },
      addUser: async (result, {userName}) => {
        var insertResult = await Users.upsertUser(userName)

        return insertResult;

      },
    }
  };

  const apolloserver =  new ApolloServer(
   {
     typeDefs: schema,
     resolvers,
     formatError: (err) => { console.log(err); return err },
     context: ({ ctx }) => ctx,
   }
  );

  serverEngine.setupApolloOnPath(apolloserver, '/graphql');


};

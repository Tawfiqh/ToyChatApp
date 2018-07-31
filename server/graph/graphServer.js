const Messages = require('../models/Messages.js');
const Users = require('../models/Users.js');
const Database = require('../core/db.js');
const { ApolloServer, gql } = require('apollo-server-koa');

function graphServer({ io }){
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

  return new ApolloServer(
   {
     typeDefs: schema,
     resolvers,
     formatError: (err) => { console.log(err); return err },
     context: ({ ctx }) => ctx,
   }
  );


}

module.exports = graphServer

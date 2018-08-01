const Messages = require('../models/Messages.js');
const Users = require('../models/Users.js');
const Database = require('../core/db.js');

const GraphSchema = require('./schema.js')

const { ApolloServer, gql } = require('apollo-server-koa');

function graphServer({ io }){
  const schema = GraphSchema();

  // Resolvers define the technique for fetching the types in the
  // schema.  We'll retrieve books from the "books" array above.
  const resolvers = {
    Query:{
      hello: ()  => "World",
      byeBye: ()  => "👋 ",
      userWithId: (result, {id}, {Users}) => {
        return Users.getUserWithId(id);
      },
      users: (result, {limit}, {Users}) => {
        return Users.getUsers(limit);
      },
      messages: (result, {limit}, {Messages}) => {
        return Messages.getMessages(limit);
      },
      newUser: async (parent, _, {Users}) => {
        var name = await Users.newUserId();
        return {name:name};
      },
    },
    Mutation: {
      sendMessage: async (result, {message}, {Messages, Users}) => {

        var result = await Messages.sendMessage(message, {Users})

        io.sockets.emit('newMessage', result); //Sends to everyone

        return result;

      },
      addUser: async (result, {userName}, {Users}) => {

        var insertResult = await Users.upsertUser(userName)
        return insertResult;

      },
    },
    User: {
      messages: async (result, _, {Messages}) => {
        return await Messages.getMessagesWithUserId(result.id);
      }
    },
    Message:{
      sender: async (result, _, {Users}) => {
        return await Users.getUserWithId(result.sender.id);
      }
    }
  };

  return new ApolloServer(
   {
     typeDefs: schema,
     resolvers,
     formatError: (err) => { console.log(err); return err },
     context: {
       Messages: new Messages(),
       Users: new Users()
     },
   }
  );


}

module.exports = graphServer

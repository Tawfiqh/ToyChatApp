const { gql } = require('apollo-server-koa');


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

module.exports = () => schema;

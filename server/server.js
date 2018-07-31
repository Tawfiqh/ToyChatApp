const { ApolloServer, gql } = require('apollo-server-koa');


const _ = require('lodash');


const socket = require('socket.io');
const sqlite3 = require('sqlite3');

const randomEmoji = require('./random-emoji')
const randomWords = require('./random-words/random-words')

const serverEngine = require('./serverEngine')


var db = null;

function db_start(){
  db = new sqlite3.Database('chatDatabase.sqlite3');
};

setupDb();


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
      ctx.body = await formatNewUserId();
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
      users: [User]
      getUsersAboveAge(age: Int!): [User]
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

        if (!limit){
          console.log("NoLimit: "+limit);
          limit = 100;
        } else{
          console.log("Limit: "+limit);
        }

        return new Promise( function(resolve, reject){

          db_start();

          var results = [];

          var hashResults = {};


          db.all(`SELECT u.userId, nickname, u.timestamp, m.timestamp as mTimestamp, body
                  FROM 'users' u
                  JOIN 'messages' m on m.userId = u.userId
                  ORDER by u.timestamp DESC
                  LIMIT $1 `,
          [limit],
          (err, rows) => {

            if (err) {
              console.log("naaaah");
              reject(err);
            }

            if(rows != undefined){

              rows.forEach((row) => {

                if(!hashResults[row["userId"]]){
                  hashResults[row["userId"]] = {
                    name: row["nickname"],
                    id: row["userId"],
                    timestamp: row["timestamp"],
                    messages: []
                  }
                }

                hashResults[row["userId"]]["messages"].push({
                  timestamp: row["mTimestamp"],
                  body: row["body"],
                  sender: hashResults[row["userId"]]
                });

              });

              Object.keys(hashResults).forEach((userId)=>{

                results.push(hashResults[userId]);

              });
            }

            resolve(results);
          });

          // close the database connection
          db.close();
        });

      },
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
          console.log("Limit: "+limit);

          // console.log("sql:" + sql);
          db.all(`SELECT m.timestamp, m.body,
                  u.nickname, u.timestamp as uTimestamp, u.userId
                  FROM 'messages' m
                  JOIN 'users' u on u.userId = m.userId
                  ORDER by m.timestamp DESC LIMIT $1;`,
           [limit], (err, rows) => {
            if (err) {
              console.log("Failed with err:"+err);
              resolve([]);
            }

            if(rows == undefined){

              resolve(results);
              return;

            }

            rows.forEach((row) => {
              results.push({
                body: row["body"],
                sender: {
                  name: row["nickname"],
                  timestamp: row["uTimestamp"],
                  id: row["userId"]
                },
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
    },
    Mutation: {
      sendMessage: async (result, {message}) => {

        console.log("Sender:" + JSON.stringify(message["sender"]));
        console.log("Body:" + JSON.stringify(message["body"]));

        // ============================== Put user into database. ==============================
        var insertResult = await upsertUser(message["sender"])

        db_start()

        db.all(`INSERT INTO messages(body, userId,timestamp) VALUES ($body, $user, strftime('%Y-%m-%d %H:%M:%S:%f','now') )`,
         {
           "$body":message["body"],
           "$user":insertResult["id"],
          }, (err, rows) => {
          if (err) {
            console.error("FAILED TO WRITE TO DB");
            return;
          }
          if(rows.length == 0) return;

          rows.forEach((row) => {
            console.log(row);
          });
        });

        // close the database connection
        db.close();
        var result  = {body: message["body"], sender:insertResult, timestamp: new Date()};
        io.sockets.emit('newMessage', result); //Sends to everyone

        return result;

      },
      addUser: async (result, {userName}) => {
        var insertResult = await upsertUser(userName)

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
     // subscriptions: {
     //  path:"/wsGraph",
     // },
   }
  );

  serverEngine.setupApolloOnPath(apolloserver, '/graphql');


  async function upsertUser(userName){
    console.log("User:" + JSON.stringify(userName) );


    db_start()

    var selectFromDb = new Promise( function(resolve, reject){

      db.all(`select userId, nickname ,timestamp from users where nickname = $nickname LIMIT 1`,
       {
         "$nickname":userName
        }, (err, rows) => {
        if (err) {
          console.error("FAILED TO WRITE TO DB");
          return;
        }

        if(rows.length == 0){
          resolve(null);
          return;
        }

        resolve(rows[0]);
        return;

      });

      // close the database connection
      db.close();

    });

    var selectResult = await selectFromDb;

    if (selectResult != null){

      return { name:selectResult["nickname"], timestamp: selectResult["timestamp"], id: selectResult["userId"]};

    }


    // ============================== Put user into database. ==============================
    db_start()

    var insertResult = new Promise( function(resolve, reject){
      db.run(`INSERT INTO users( nickname ,timestamp) VALUES ($nickname, strftime('%Y-%m-%d %H:%M:%S:%f','now') )`,
       {
         "$nickname":userName
       }, function(err){
        if (err) {
          console.error("FAILED TO WRITE TO DB");
          resolve(null);
          return;
        }
        resolve(this.lastID);


      });
    });

    // close the database connection
    db.close();


    var insertId = await insertResult;

    if (insertId == null){
      return { };
    }

    return { name:userName, timestamp: new Date(), id: insertId};


  }


};


function setupDb(){
  db_start();

  db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS messages (body TEXT, userId INTEGER, timestamp TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS users (userId INTEGER PRIMARY KEY AUTOINCREMENT, nickname TEXT, timestamp TEXT)");
    // db.run("CREATE TABLE IF NOT EXISTS chats (userId TEXT, sender Int, timestamp DATETIME(6))");
  });

  db.close();

}

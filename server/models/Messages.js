const Database = require('../core/db.js');
var DataLoader = require('dataloader');

var db = new Database(process.env.DATABASE);

class Messages{

  constructor(){

    // Parallelize all queries, but do not cache.
    this.queryLoader = new DataLoader(queries => new Promise(resolve => {
      var waitingOn = queries.length;
      var results = [];
      db.start();

      db.parallelize(() => {
        queries.forEach((query, index) => {
          console.log("+quryLoad:" + query);
          db.all.apply(db, query.concat((error, result) => {
            results[index] = error || result;
            if (--waitingOn === 0) {
              resolve(results);
            }
          }));
        });
      });
    }), { cache: false });


    this.messageLoader = new DataLoader(ids => {
      var params = ids.map(id => '?' ).join();
      var query = `SELECT * FROM messages WHERE userId IN (${params})`;
      return this.queryLoader.load([query, ids]).then(
        rows => ids.map(
          id => rows.find(row => row.userId == id) || new Error(`Row not found: ${id}`)
        )
      );
    });


  }

  getMessages(limit){

    if (!limit){
      limit = 10;
    }
    var messageLoader = this.messageLoader;
    return new Promise( function(resolve, reject){

      db.start();

      var results = [];

      db.all(`SELECT m.timestamp, m.body, m.userId
              FROM 'messages' m
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

        var saveMessages =  {};

        rows.forEach((row) => {

          var userMessage = {
            body: row["body"],
            sender: {
              id: row["userId"]
            },
            timestamp: row["timestamp"],
          };

          results.push(userMessage);
          if(saveMessages[row["userId"]] == undefined){
            saveMessages[row["userId"]] = []
          }
          saveMessages[row["userId"]].push(userMessage);
        });

        Object.keys(saveMessages).forEach((userId)=>{
          messageLoader.prime(userId, saveMessages[userId] )
        });

        resolve(results);
      });

      // close the database connection
      db.close();
    });
  }

  getMessagesWithUserId(userId){

    return new Promise( function(resolve, reject){

      db.start();

      var results = [];

      db.all(`SELECT m.timestamp, m.body, m.userId
              FROM 'messages' m
              where userId = ?
              ORDER by m.timestamp DESC;`,
       [userId], (err, rows) => {
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
              id: row["userId"]
            },
            timestamp: row["timestamp"],
          });

        });

        resolve(results);
      });

      // close the database connection
      db.close();
    });
  }

  async sendMessage(message, {Users}){

    console.log("Sender:" + JSON.stringify(message["sender"]));
    console.log("Body:" + JSON.stringify(message["body"]));

    // ============================== Put user into database. ==============================
    var insertResult = await Users.upsertUser(message["sender"])

    db.start()

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
    return {body: message["body"], sender:insertResult, timestamp: new Date()};

  }

}

module.exports = Messages;

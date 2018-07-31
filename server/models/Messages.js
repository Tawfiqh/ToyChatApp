const Database = require('../core/db.js');
const Users = require('./Users.js');

var db = new Database(process.env.DATABASE);

class Messages{

  getMessages(limit){

    if (!limit){
      console.log("NoLimit: "+limit);
      limit = 10;
    } else{
      console.log("Limit: "+limit);
    }

    return new Promise( function(resolve, reject){

      db.start();

      var results = [];
      console.log("Limit: "+limit);

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
  }

  async sendMessage(message){

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

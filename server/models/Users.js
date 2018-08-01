const randomWords = require('../random-words/random-words');
const randomEmoji = require('../random-emoji');
const Database = require('../core/db.js');
var DataLoader = require('dataloader');
var sqlite3 = require('sqlite3');

var db = new Database(process.env.DATABASE);



class Users{

  constructor(){
    this.userLoader = new DataLoader(ids => {
      var params = ids.map(id => '?' ).join();
      var query = `SELECT * FROM users WHERE userId IN (${params})`;
      return queryLoader.load([query, ids]).then(
        rows => ids.map(
          id => rows.find(row => row.userId == id) || new Error(`Row not found: ${id}`)
        )
      );
    });

    // Parallelize all queries, but do not cache.
    this.queryLoader = new DataLoader(queries => new Promise(resolve => {
      var waitingOn = queries.length;
      var results = [];

      db.parallelize(() => {
        queries.forEach((query, index) => {
          console.log("\n\nHitting DB for query:" + query+"\n\n");
          db.all.apply(db, query.concat((error, result) => {
            results[index] = error || result;
            if (--waitingOn === 0) {
              resolve(results);
            }
          }));
        });
      });
    }), { cache: false });


  }

  async newUserId(){

    var newId = await randomWords();
    newId = newId.replace(/[\s-]/g, "_"); // Replace white spaces and dahes with underscore.
    newId = randomEmoji() + newId + randomEmoji();
    console.log("newId:" + newId);

    return newId;

  };

  async upsertUser(userName){
    console.log("User:" + JSON.stringify(userName) );


    db.start()
    var userLoader = this.userLoader;
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
        userLoader.prime(rows[0].userId, rows[0]);
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
    db.start()

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


  };

  getUsers(limit){

    if (!limit){
      limit = 100;
    }
    var userLoader = this.userLoader;

    return new Promise( function(resolve, reject){

      db.start();

      var results = [];

      var hashResults = {};


      db.all(`SELECT u.userId, nickname, u.timestamp
              FROM 'users' u
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
            userLoader.prime(rows[0].userId, rows[0]);

            results.push(
              {
                name: row["nickname"],
                id: row["userId"],
                timestamp: row["timestamp"],
                messages: []
              }
            );


          });

        }

        resolve(results);
      });

      // close the database connection
      db.close();
    });

  };

  getUserWithId(userId){

    if (!userId == null || userId == undefined){
      return null; //new Promise(function(resolve, reject){resolve(null)});;
    }

    return this.userLoader.load(userId).then(row => {
        var result = {
          id: row["userId"],
          name: row["nickname"],
          timestamp: row["timestamp"],
          messages: []
        };

        return result;

      });

  };

}
module.exports = Users
;

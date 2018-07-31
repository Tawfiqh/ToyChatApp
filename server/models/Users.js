const randomWords = require('../random-words/random-words');
const randomEmoji = require('../random-emoji');
const Database = require('../db.js');

var db = new Database(process.env.DATABASE);


async function newUserId(){

  var newId = await randomWords();
  newId = newId.replace(/[\s-]/g, "_"); // Replace white spaces and dahes with underscore.
  newId = randomEmoji() + newId + randomEmoji() ;
  console.log("newId:" + newId);

  return newId;

};

async function upsertUser(userName){
  console.log("User:" + JSON.stringify(userName) );


  db.start()

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

function getUsers(limit){

  if (!limit){
    console.log("NoLimit: "+limit);
    limit = 100;
  } else{
    console.log("Limit: "+limit);
  }

  return new Promise( function(resolve, reject){

    db.start();

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

};


module.exports = {
  newUserId,
  upsertUser,
  getUsers
}

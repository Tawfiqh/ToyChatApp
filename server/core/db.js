const sqlite3 = require('sqlite3');


class DbObject {

  // get db() {
  //   this.db;
  // }

  constructor(dbAddress) {
      this.dbAddress = dbAddress;

      this.start(this.db);

      var callbackDb = this.db;

      this.db.serialize(function() {
        callbackDb.run("CREATE TABLE IF NOT EXISTS messages (body TEXT, userId INTEGER, timestamp TEXT)");
        callbackDb.run("CREATE TABLE IF NOT EXISTS users (userId INTEGER PRIMARY KEY AUTOINCREMENT, nickname TEXT, timestamp TEXT)");
        // db.run("CREATE TABLE IF NOT EXISTS chats (userId TEXT, sender Int, timestamp DATETIME(6))");
      });

      this.close();
      return this;
  }

  start(){
    if (!this.dbAddress){
      throw Error("No database address set");
    }
    // console.log(">>>>>>>Opening connecting to db: "+this.dbAddress);
    this.db = new sqlite3.Database(this.dbAddress);
  }

  close(){
    // console.log(">>>>>>>Closing connecting to db: "+this.dbAddress);
    this.db.close();
  }

  all(query, variables, callback){
    console.log("+querying:" + query.replace(/\n/g, " ").replace(/  /g," ").substring(0,103));
    this.db.all(query, variables, callback);
  }

  run(query, variables, callback){
    console.log("+querying:" + query.replace(/\n/g, " ").replace(/  /g," ").substring(0,103));
    this.db.run(query, variables, callback);
  }


};

module.exports = DbObject;

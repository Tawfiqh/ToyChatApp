
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('chatDatabase.sqlite3');

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS messages (body TEXT, userId Int, timestamp DATETIME(6))");
  db.run("CREATE TABLE IF NOT EXISTS users (userId TEXT, sender Int, timestamp DATETIME(6))");
  // db.run("CREATE TABLE IF NOT EXISTS chats (userId TEXT, sender Int, timestamp DATETIME(6))");
});

db.close();

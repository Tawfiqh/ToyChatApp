var DataLoader = require('dataloader');
var sqlite3 = require('sqlite3');

var db = new sqlite3.Database('chatDatabase.sqlite3');

// Dispatch a WHERE-IN query, ensuring response has rows in correct order.
var userLoader = new DataLoader(ids => {
  var params = ids.map(id => '?' ).join();
  var query = `SELECT * FROM users WHERE userId IN (${params})`;
  return queryLoader.load([query, ids]).then(
    rows => ids.map(
      id => rows.find(row => row.userId == id) || new Error(`Row not found: ${id}`)
    )
  );
});

// Parallelize all queries, but do not cache.
var queryLoader = new DataLoader(queries => new Promise(resolve => {
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

// Usage

var promise1 = userLoader.load('1');
var promise2 = userLoader.load('1');
var promise3 = userLoader.load('3');
var promise4 = userLoader.load('1');
var promise5 = userLoader.load('3');
var promise6 = userLoader.load('3');

Promise.all([ promise1, promise2, promise3, promise4, promise5, promise6 ]).then(([ user1, user2, user3, user4, user5, user6]) => {
  console.log("\nuser1: "+JSON.stringify(user1));
  console.log("\nuser2: "+JSON.stringify(user2));
  console.log("\nuser3: "+JSON.stringify(user3));
  console.log("\nuser4: "+JSON.stringify(user4));
  console.log("\nuser5: "+JSON.stringify(user5));
  console.log("\nuser6: "+JSON.stringify(user6));
});

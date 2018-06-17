const _ = require('lodash')
const fs = require('fs')

const list = __dirname + "/web2a";

function wordListLength(){

  var i;
  var lineCount = 0;

  const LINE_FEED = '\n'.charCodeAt(0);

  const reader = fs.createReadStream(list);

  reader.on('data', function(chunk) {
      for (i=0; i < chunk.length; ++i)
        if (chunk[i] == LINE_FEED) lineCount++;
    });


    return new Promise(function(resolve, reject){
      reader.on('end', function() {
        resolve(lineCount);
      });

      reader.on('error', reject);
    });
}

function getWordFromList(n){

  var i;
  var lineCount = 0;
  var result;
  const LINE_FEED = '\n'.charCodeAt(0);

  const reader = fs.createReadStream(list);
  reader.on('data', function(chunk) {
    var lastLine = 0;

    for (i=0; i < chunk.length; ++i){

      //Found new Line
      if (chunk[i] == LINE_FEED){
        lineCount++;

        //Found the line we wanted from the file.
        if (lineCount == n){

          //Copy our results to a new buffer so we can take a substring.
          result = new Buffer.alloc(i - lastLine);
          chunk.copy(result, 0, lastLine, i);

          result = result.toString('utf8');

         }
         else{
           // Skip the "\n" and read from the start of the next line.
           lastLine = i+1;
         }
      }
    }
  });


    return new Promise(function(resolve, reject){
      reader.on('end', function() {
        // console.log(result);
        resolve(result);
      });

      reader.on('error', reject);
    });
}

async function randomWords(){

  const n = await wordListLength();
  const indx = _.random(n); //Random number between 0 and n.

  const word = await getWordFromList(indx);

  return word;
}

module.exports = randomWords;

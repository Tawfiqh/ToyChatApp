const randomWords = require('../random-words/random-words');
const randomEmoji = require('../random-emoji');


async function newUserId(){

  var newId = await randomWords();
  newId = newId.replace(/[\s-]/g, "_"); // Replace white spaces and dahes with underscore.
  newId = randomEmoji() + newId + randomEmoji() ;
  console.log("newId:" + newId);

  return newId;

}



module.exports = {
  newUserId
}

require('dotenv').load();

const _ = require('lodash');

const randomEmoji = require('./random-emoji')
const serverEngine = require('./core/serverEngine')
const Users = require('./models/Users.js');
const GraphServer = require('./graph/graphServer.js');
const SocketServer = require('./misc/SocketServer.js');

var port = 4000;
var {server, router} = serverEngine.setup(port);

const io = new SocketServer({server});

const graphServer = new GraphServer({ io });

serverEngine.setupGraphServerOnPath(graphServer, '/graphql');

setupOtherEndpoints(router);






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
      ctx.body = await Users.newUserId();
    });

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

const socket = require('socket.io');

function SocketServer({ server }){

  const io = new socket(server)


  io.on('connection', function(socket){
    console.log('a user connected')

    socket.on('join', function(data) {
  		console.log(data);
  	});

    socket.on('messages', function(data){
      console.log("Recieved: " + JSON.stringify(data))

      io.sockets.emit('newMessage', data); //Sends to everyone
      // socket.emit('newMessage', data); //Only sends to sender
  		// socket.broadcast.emit('newMessage', data); // sends to everyone apart from sender.
  	});

  });

  return io;
}

module.exports = SocketServer

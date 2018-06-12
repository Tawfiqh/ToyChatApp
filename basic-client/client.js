// initializing socket, connection to server

var socket = io.connect('/');
socket.on('connect', function(data) {
    socket.emit('join', 'Hello server from client');
});

function addToRecord(data, type){
  $('#message-container').append('<li><span style="float: left;">' + type + '</span>' + data + '</li>');
}
  // listener for 'cppp' event, which updates messages
socket.on('cppp', function(data) {
    addToRecord(data, "Got :");
  });

  // sends message to server, resets & prevents default form action
  $('form').submit(function() {
  	var message = $('#message').val();
    addToRecord(message, "Sent:");
  	socket.emit('messages', message);
  	// this.reset();
  	return false;
  });

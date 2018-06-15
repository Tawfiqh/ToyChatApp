// initializing socket, connection to server

var socket = io();
var myId = "";
setupMyId();

socket.on('connect', function(data) {
    socket.emit('join', 'Hello server from client');
});

function addToRecord(data, type){
  $('#message-container').append('<li><span style="float: left;">' + type + '</span>' + data + '</li>');
}
  // listener for 'cppp' event, which updates messages
socket.on('cppp', function(data) {
  var sentBy = data.sender + "  : "
  addToRecord(data.message, sentBy);
});

  // sends message to server, resets & prevents default form action
  $('form').submit(function() {
  	var message = $('#message').val();
  	socket.emit('messages', {sender: myId, message: message});
  	// this.reset();
  	return false;
  });



function setupMyId(){
  myId = getNewId();

  //Set the id field.
  var fieldVal = "Your ID is: " + myId
  $("#myIdField").text(fieldVal)
}

function getNewId(){
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", "/new-user-id", false ); // false for synchronous request
  xmlHttp.send( null );
  return xmlHttp.responseText;
}

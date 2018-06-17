<template>
  <div id="chat" >
    <h1> Chat! </h1>
    <h3>Your ID is: {{ myId }}</h3>
    <form>
        <input id="message" type="text" placeholder="message">
        <input type="submit" value="Send">
    </form>

    <ul id="message-container">

    </ul>
  </div>

</template>

<script>
import axios from 'axios'
import io from 'socket.io'


export default {
  name: 'chat',
  components: {
  },
  data: () => ({
    myId: "-"
  }),
  methods:{
  },
  mounted() {
    this.myId = getNewId();

    console.log("mounted");
    // initializing socket, connection to server
    var socket = io("localhost:3000/");
    console.log("mounted3");
    console.log("2mounted");

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





    function getNewId(){
      // return "⛱folk_theater🇲🇦"
      console.log("getNewId")
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", "/new-user-id", false ); // false for synchronous request
      xmlHttp.send( null );
      return xmlHttp.responseText || "⛱folk_theater🇲🇦";
    }

  },
  beforeDestroy() {
    // socket.removeListener('cppp', this.NewMessage);
  }
}



</script>

<style>
html, body {
  text-align: center;
  font-family: 'Avenir Next', 'Helvetica', 'Arial', sans-serif;
}

html,body,li,form,ul {
  padding: 0;
  margin: 0;
}

form {
  padding-bottom: 2%;
}

li {
  list-style: none;
  width: 100vw;
  height: 35px;
  line-height: 35px;
}

li:nth-child(odd) {
  background: #eee;
}


</style>

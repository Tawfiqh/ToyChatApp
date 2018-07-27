<template>
  <div id="chat" >
    <h1> Graph QL Chat! </h1>
    <h3>Your ID is: {{ myId }}</h3>

    <input type="text" v-on:keyup.enter="submitForm();" v-model="message" placeholder="Type message">
    <a class="toggle-bar" v-on:click="submitForm();" href="#">🛫</a>

    <ul id="message-container">
      <li v-for="(message, index) in messages" v-bind:key="index">
        <span class="user-span"> {{message.sender}} </span> {{message.message}}
      </li>
    </ul>
  </div>

</template>

<script>
import io from 'socket.io-client';

export default {
  name: 'GraphChat',
  components: {
  },
  data: () => ({
    myId: "-",
    messages: [],
    socket: null,
    message: "",
  }),
  methods:{
    submitForm(){
      console.log("Submitting with:" + this.message);
      this.socket.emit('messages', {sender: this.myId, message: this.message});
      this.message = "";
    }
  },
  mounted() {
   this.myId = getNewId();
   this.socket = io(process.env.VUE_APP_BASE_URL);

   var socket = this.socket;

   socket.on('connect', function(data) {
       socket.emit('join', 'Hello server from client');
   });

   var messages = this.messages; //XXYZ - might be superfluous.
   function addToRecord(data, sender){
     messages.unshift({message:data, sender:sender});
   }
     // listener for 'newMessage' event, which updates messages
   socket.on('newMessage', function(data) {
     var sentBy = data.sender + "  : "
     addToRecord(data.message, sentBy);

   });

    function getNewId(){
      // return "⛱folk_theater🇲🇦"
      console.log("getNewId")
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", `${process.env.VUE_APP_BASE_URL}new-user-id`, false ); // false for synchronous request
      xmlHttp.send( null );
      console.log(xmlHttp);

      if (xmlHttp.status == 200){
        return xmlHttp.response
      }
      else{
        return "⛱folk_theater🇲🇦"
      }
    }

  },
  beforeDestroy() {
    this.socket.removeListener('newMessage');
  }
}



</script>

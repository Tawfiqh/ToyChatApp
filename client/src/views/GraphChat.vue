<template>
  <div id="chat" >
    <h1> Graph QL Chat! </h1>
    <h4> {{ query }} </h4>
    <h3> {{ queryResult }} </h3>
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
  data: () => ({
    myId: "-",
    messages: [],
    message: "",
    query: "{?}",
    queryResult: "?"
  }),
  methods:{
    async submitForm(){
      console.log("Submitting with:" + this.message);

      const endpoint = `${process.env.VUE_APP_BASE_URL}graph`;
      var body = {
        "query": "mutation queryTest( $body: String, $sender: String ){ sendMessage(message:{body: $body, sender: $sender}){ timestamp } }",
        "variables": { "body": this.message, "sender": this.myId}
      }
      const { data } = await this.axios.post( endpoint, body );

      this.message = "";
    },
    async getNewId(){
      // return "⛱ folk_theater🇲🇦 "

      const endpoint = `${process.env.VUE_APP_BASE_URL}graph`;
      var body = { "query": "{newUser{ name }}" };
      const { data } = await this.axios.post( endpoint, body );


      return this._.get(data, "data.newUser.name", "⛱ folk_theater🇲🇦" );

    }
  },
  beforeMount() {

   this.getNewId().then((res)=>{
     this.myId = res;
   });

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


  },
  beforeDestroy() {
    this.socket.removeListener('newMessage');
  }
}



</script>

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
        <span class="time-span"> {{message.timestamp.toTimeString().substr(0,8)}} </span> <span class="user-span"> {{message.sender}} </span> {{message.message}}
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
    queryResult: "?",
    socket: null
  }),
  methods:{
    async submitForm(){
      // console.log("Submitting with:" + this.message);

      const endpoint = `${process.env.VUE_APP_BASE_URL}graphql`;
      var body = {
        "query": "mutation queryTest( $body: String, $sender: String ){ sendMessage(message:{body: $body, sender: $sender}){ timestamp } }",
        "variables": { "body": this.message, "sender": this.myId}
      }
      const { data } = await this.axios.post( endpoint, body );

      this.message = "";
    },
    async getNewId(){
      // return "⛱ folk_theater🇲🇦 "

      const endpoint = `${process.env.VUE_APP_BASE_URL}graphql`;
      var body = { "query": "{newUser{ name }}" };
      const { data } = await this.axios.post( endpoint, body );


      return this._.get(data, "data.newUser.name", "⛱ folk_theater🇲🇦" );

    },
    async getRecentMessages(){

      const endpoint = `${process.env.VUE_APP_BASE_URL}graphql`;
      var body = {
        "query": "query queryTest( $limit : Int ){ messages(limit: $limit){ body, sender, timestamp } }",
        "variables":{"limit": 10}
      }
      const { data } = await this.axios.post( endpoint, body );

      return this._.get(data, "data.messages", [] );

    }
  },
  beforeMount() {

    this.getNewId().then((res)=>{
     this.myId = res;
    });


    var messages = this.messages; //XXYZ - might be superfluous.
    function addToRecord(data, sender, timestamp){
      var sentBy = sender + "  : "
      messages.unshift({message:data, sender:sentBy, timestamp:new Date(timestamp)}); //Add to beginning of array.
    }

    this.socket = io(process.env.VUE_APP_BASE_URL);

    var socket = this.socket;

    socket.on('connect', function(data) {
       socket.emit('join', 'Hello server from client');
    });

    this.getRecentMessages().then((res) => {

      for(var i = res.length -1; i>= 0 ;i--){
        var message = this._.get(res, [i, "body"], null);
        var timestamp = this._.get(res, [i, "timestamp"], "");
        if (timestamp == null || message == null){
          continue;
        }
        addToRecord(message, res[i].sender, timestamp);
      }

    });

   socket.on('newMessage', function(data) {

     addToRecord(data.body, data.sender, data.timestamp);

   });


  },
  beforeDestroy() {
    this.socket.removeListener('newMessage');
  }
}



</script>

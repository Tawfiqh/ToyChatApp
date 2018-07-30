<template>
  <div id="chat" >
    <h1> Graph QL Chat! </h1>

    <div class="row">

      <div class = "col-1">

        <h3>Your ID is: {{ myId }}</h3>

        <input type="text" v-on:keyup.enter="submitForm();" v-model="message" placeholder="Type message">
        <a class="toggle-bar" v-on:click="submitForm();" href="#">🛫</a>

        <ul id="message-container">
          <li v-for="(message, index) in messages" v-bind:key="index">
            <span class="time-span"> {{message.timestamp.toTimeString().substr(0,8)}} </span> <span class="user-span"> {{message.sender}} </span> {{message.message}}
          </li>
        </ul>

      </div>

      <div class="col-2">

        <h4 class="code"> {{ query }} </h4>
        <p class="code"> {{ queryResult }} </p>

      </div>
    </div>


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
    query: "",
    queryResult: "",
    socket: null
  }),
  methods:{
    async submitForm(){
      // console.log("Submitting with:" + this.message);

      const endpoint = `${process.env.VUE_APP_BASE_URL}graphql`;
      var body = {
        "query": "mutation queryTest( $body: String, $sender: String ){ sendMessage(message:{body: $body, sender: $sender}){ body timestamp sender{ name id timestamp } } }",
        "variables": { "body": this.message, "sender": this.myId}
      }
      const { data } = await this.axios.post( endpoint, body );
      this.query = JSON.stringify(body,null,2);
      this.queryResult = JSON.stringify(data,null,2);

      console.log("Post:"+endpoint);

      this.message = "";
    },
    async getNewId(){
      // return "⛱ folk_theater🇲🇦 "

      const endpoint = `${process.env.VUE_APP_BASE_URL}graphql`;
      var body = { "query": "{newUser{ name }}" };
      const { data } = await this.axios.post( endpoint, body );

      // this.query = JSON.stringify(body,null,2);
      // this.queryResult = JSON.stringify(data,null,2);

      return this._.get(data, "data.newUser.name", "⛱ folk_theater🇲🇦" );

    },
    async getRecentMessages(){

      const endpoint = `${process.env.VUE_APP_BASE_URL}graphql`;
      var body = {
        "query": "query queryTest( $limit : Int ){ messages(limit: $limit){ body, sender{ name }, timestamp } }",
        "variables":{"limit": 10}
      }
      const { data } = await this.axios.post( endpoint, body );
      this.query = JSON.stringify(body,null,2);
      this.queryResult = JSON.stringify(data,null,2);

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
        var sender = this._.get(res, [i, "sender", "name"], null);
        var message = this._.get(res, [i, "body"], null);
        var timestamp = this._.get(res, [i, "timestamp"], "");
        if (timestamp == null || message == null|| sender == null){
          continue;
        }
        addToRecord(message, sender, timestamp);
      }

    });

   socket.on('newMessage', function(data) {
     addToRecord(data.body, data.sender.name, data.timestamp);
   });

  },
  beforeDestroy() {
    this.socket.close();
  }
}



</script>
<style>

  .col-1{
    flex-basis: 70%;
  }

  .col-2{
    flex-basis: 30%;
  }

  .row{
    display: flex;
    flex-direction: column;
  }

  @media (max-width: 768px) {
    .row{
      /* flex-direction: column-reverse; */
    }
    .col-2{
      /* display: none; */
    }

  }

  .code{
    text-align: left;
    font-family: monospace;
    white-space: pre;
    word-wrap: break-word;
    white-space: pre-wrap;
  }


</style>

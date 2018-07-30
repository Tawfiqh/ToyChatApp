<template>
  <div id="chat" >
    <h1> GraphQuery! </h1>
    <h3>{{ query }}</h3>



  </div>

</template>

<script>

export default {
  name: 'GraphDemo',

  data: () => ({

    query: "hi",
  }),
  methods:{


  },
  async mounted() {
    const endpoint = `${process.env.VUE_APP_BASE_URL}graphql`;
    console.log("endpoint:"+endpoint);
    var body = { "query": "{Users{name age}}" };
    // // const { data } = await this.axios.post( endpoint, body );
    //
    // this.query = data["data"];


    var exampleSocket = new WebSocket("ws://localhost:5000/graphql");

    exampleSocket.onopen = function (event) {
      console.log("OPEN");
      exampleSocket.send("subscription { messageAdded(channelId: 1) { id  text}}");
    };

    exampleSocket.onmessage = function (event) {
      console.log(event.data);
    }

    // ws.on('messageAdded', function incoming(data) {
    //   console.log("THIS FROM WS" + data);
    // });


  },
  beforeDestroy() {

  }
}



</script>

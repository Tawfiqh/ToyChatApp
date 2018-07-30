<template>
  <div id="chat" >
    <h1> GraphQuery! </h1>
    <a class="emoji-button" v-on:click="requestNew();" href="#">🦅</a>

    <h3 class="code"> {{ query }} </h3>
    <br  />
    <p class="code"> {{ queryResult }} </p>


  </div>

</template>

<script>

export default {
  name: 'GraphDemo',

  data: () => ({
    queryResult: "",
    query: "hi"
  }),
  methods:{
    async requestNew(){
      const endpoint = `${process.env.VUE_APP_BASE_URL}graphql`;
      console.log("endpoint:"+endpoint);
      var body = { "query": "{newUser {name}}" };
      const { data } = await this.axios.post( endpoint, body );

      this.query = JSON.stringify(body,null,2);
      this.queryResult = JSON.stringify(data,null,2);

    }
  },
  async mounted() {
    this.requestNew();



  },
  beforeDestroy() {

  }
}

</script>


<style>
.emoji-button{
  font-size: 60px;
  transition: all 0.2s;
  text-shadow: 2px 2px rgba(0,0,0,0);
  text-decoration: none;
  line-height: 75px;
}

.emoji-button:hover{
  font-size: 75px;
  text-shadow: 2px 2px #cc6700;
}

.emoji-button:active{
  font-size: 70px;
}

</style>

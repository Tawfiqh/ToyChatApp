<template>
  <div id="chat" >
    <h1> GraphQuery! </h1>
    <h3>{{storeVal}}</h3>
    <pre>{{storeVal1}}</pre>
    <pre>{{storeVal2}}</pre>
    <pre>{{storeVal3}}</pre>
    <a class="emoji-button" v-on:click="requestNew();" href="javascript:">🦅</a><a class="emoji-button" v-on:click="emptyVueX();" href="javascript:">🚮</a>

    <h3 class="code"> {{ query }} </h3>
    <br  />
    <p class="code"> {{ queryResult }} </p>


  </div>

</template>

<script>
import store from '../store.js';

export default {
  name: 'GraphDemo',

  data: () => ({
    queryResult: "",
    query: "hi",
    storeVal: 0,
    storeVal1: 0,
    storeVal2: 0,
    storeVal3: 0,
  }),
  methods:{
    updateVueXView(){
      this.storeVal = store.state.visitors;
      this.storeVal1 = store.getters.lastVisitor;
      this.storeVal2 = store.getters.uniqueVisitors;
      this.storeVal3 = store.getters.longestName;
    },
    async requestNew(){
      const endpoint = `${process.env.VUE_APP_BASE_URL}graphql`;
      console.log("endpoint:"+endpoint);
      var body = { "query": "{newUser {name}}" };
      const { data } = await this.axios.post( endpoint, body );

      this.query = JSON.stringify(body,null,2);
      this.queryResult = JSON.stringify(data,null,2);

      var newName = this._.get(data, ["data", "newUser", "name"], null);
      store.commit('addVisitor', newName);
      this.updateVueXView();


    },
    emptyVueX(){
      store.commit('empty');
      this.updateVueXView();
    }
  },
  async mounted() {
    // this.requestNew();
    this.updateVueXView();
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

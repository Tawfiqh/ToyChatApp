<template>
  <div id="chat" >
    <h1> Demo Page! </h1>

    <a class="emoji-button" v-on:click="requestNew();" href="javascript:">🦅</a><a class="emoji-button" v-on:click="emptyVueX();" href="javascript:">🚮</a>

    <h3 class="code">{{ query }} </h3>
    <br  />
    <p class="code">{{ queryResult }} </p>

    <hr  />
    <pre class="code">
userName: {{store.state.userName}},
uniqueVisitors: {{store.getters.uniqueVisitors}},
longestName: {{store.getters.longestName}},

visitors:
<span class="smaller-line-breaks">{{store.state.visitors}}</span>
    </pre>


  </div>

</template>

<script>
import store from '../store.js';

export default {
  name: 'GraphDemo',

  data: () => ({
    queryResult: "",
    query: "hi",
    store: store
  }),
  methods:{
    async requestNew(){

      const endpoint = `${process.env.VUE_APP_BASE_URL}${process.env.VUE_APP_GRAPH_URL}`;

      var body = { "query": "{newUser {name}}" };
      const { data } = await this.axios.post( endpoint, body );

      this.query = JSON.stringify(body,null,2);
      this.queryResult = JSON.stringify(data,null,2);

      var newName = this._.get(data, ["data", "newUser", "name"], null);

      // store.commit('setNewUserName');
      store.commit('addVisitor', newName);

    },
    emptyVueX(){
      store.commit('empty');
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

.smaller-line-breaks{
  white-space: normal;
}

</style>

<template>
  <div id="chat" >
    <h1> Users! ( view only ) <a class="emoji-button hidden" v-on:click="fetchUsers();" href="javascript:">🦅</a></h1>
    <h3>Current User: {{storedUser}}</h3>

    <pre class="code">Vue-X store<br />{{storedUserList}}</pre>

    <hr  />

    <h3 class="code">GraphQuery:<br /><br />{{ query }} </h3>
    <br  />
    <p class="code">GraphResult: <br /><br />{{ queryResult }} </p>


  </div>

</template>

<script>
import store from '../store.js';

export default {
  name: 'Users',

  data: () => ({
    queryResult: "",
    query: "hi",
    storedUser: "",
    storedUserList: []
  }),
  methods:{
    updateVueXView(){
      this.storedUser = store.state.userName;
      this.storedUserList = store.state.visitors;
    },
    async fetchUsers(){
      const endpoint = `${process.env.VUE_APP_BASE_URL}${process.env.VUE_APP_GRAPH_URL}`;

      var body = { "query": "{users {name timestamp id} }" };
      const { data } = await this.axios.post( endpoint, body );

      this.query = JSON.stringify(body,null,2);
      this.queryResult = JSON.stringify(data,null,2);

      var newName = this._.get(data, ["data", "newUser", "name"], null);

      store.commit('addVisitor', newName);
      this.updateVueXView();

    }
  },
  async mounted() {
    await this.fetchUsers();
  }
}

</script>


<style>

  hr{
    border: 1px solid grey;
    margin: 100px 5px;
  }

</style>

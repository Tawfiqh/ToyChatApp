<template>
  <div id="app">
    <div id="nav" v-bind:class='{ "flared-nav": devMode }'>
      <router-link to="/">👇</router-link> |
      <router-link to="/chat">chat</router-link> |
      <router-link to="/graph-demo">Gql</router-link> |
      <router-link to="/graph-chat"> 📊 💬 </router-link>
    </div>
    <router-view/>
  </div>
</template>


<script>
export default {
  name: 'App',
  data: () => ({
    devMode: (process.env.NODE_ENV === 'development'),
  }),
}
</script>


<style>

body, html{
  height: 100vh;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-image: linear-gradient(to top, #feada6 0%, #f5efef 100%);
  min-height: 100vh;
  padding: 0 10%;
  overflow: auto;
  background-attachment: fixed;
}

#nav {
  padding: 30px;
}

#nav.flared-nav{
  background: #A770EF;  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #FDB99B, #CF8BF3, #A770EF);  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #FDB99B, #CF8BF3, #A770EF); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  /* width: 100vw; */
  margin-top: -30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>

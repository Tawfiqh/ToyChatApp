<template>
  <div id="app" >
    <p>{{ message }}</p>

    <a class="toggle-bar" v-on:click="addEmoji();" href="#">👇</a>
    <div class="smiley-container">
      <SmileyItem v-for="emoji in smileys" :smiley="{char: emoji}"></SmileyItem>
    </div>
  </div>
</template>

<script>
import SmileyItem from './components/SmileyItem.vue'

export default {
  name: 'app',
  components: {
    SmileyItem
  },
  data: () => ({
    message: 'Click the hand.',
    smileys:[],
  }),
  methods:{
   addEmoji(){
    var randomEmoj = "🍞"; // todo
    this.smileys.push(randomEmoj)
   }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

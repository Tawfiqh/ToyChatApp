<template>
  <div id="hello" >
    <p>{{ message }}</p>

    <a class="toggle-bar" v-on:click="addEmoji();" href="#">👇</a>
    <a class="toggle-bar" v-on:click="addEmojiExternal();" href="#">🛬</a>
    <div class="smiley-container">
      <SmileyItem v-for="emoji in smileys" v-bind:key="emoji" :smiley="{char: emoji}"></SmileyItem>
    </div>
  </div>

</template>

<script>
import SmileyItem from '@/components/SmileyItem.vue'
import axios from 'axios'

export default {
  name: 'hello',
  components: {
    SmileyItem
  },
  data: () => ({
    message: 'Click the hand.',
    smileys:[],
    errors:[]
  }),
  methods:{
   async addEmoji(){

     try {
       console.log(process.env.NODE_ENV);
       console.log(process.env.VUE_APP_BASE_URL);
       console.log(process.env.VUE_APP_RANDO);
       const { data } = await axios.get(`${process.env.VUE_APP_BASE_URL}emoji`)
       // JSON responses are automatically parsed.
       this.smileys.push(data);

     } catch (e) {
       this.errors.push(e)
       this.smileys.push("🚫")
     }
   },
   async addEmojiExternal(){

     try {
       console.log(process.env.NODE_ENV);
       console.log(process.env.VUE_APP_BASE_URL);
       console.log(process.env.VUE_APP_RANDO);
       const { data } = await axios.get(`https://ranmoji.herokuapp.com/emojis/api/v.1.0/`)
       // JSON responses are automatically parsed.
       console.log(data)
       var tag = document.createElement('div');
       tag.innerHTML = data.emoji;
       var data2 = tag.innerText

       this.smileys.push(data2)

     } catch (e) {
       this.errors.push(e)
       this.smileys.push("🚫")
     }
   },
   async NewMessage(data) {

   },
  },
  // mounted() {
  //   socket.on('cppp', this.NewMessage);
  // },
  // beforeDestroy() {
  //   socket.removeListener('cppp', this.NewMessage);
  // }
}
</script>

<style>
#app{
 display: flex;
 flex-direction: column;
 min-height: 100vh;
 height: 100%;
 align-items: center;
 padding: 150px;
 padding-top: 0;
}

@media (max-width: 767px){
  #app{
    padding: 25px;
  }
}

.toggle-bar{
 font-size: 50px;
 text-decoration: none;
}

.smiley-container{
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}

</style>

import Vue from 'vue'
import Router from 'vue-router'
import Chat from './views/Chat.vue'
import Hello from './views/Hello.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/chat',
      name: 'chat',
      component: Chat
    },
  ]
})

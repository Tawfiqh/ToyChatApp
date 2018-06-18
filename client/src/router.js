import Vue from 'vue'
import Router from 'vue-router'
import Chat from './views/Chat.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: () => import('./views/Hello.vue')
    },
    {
      path: '/chat',
      name: 'chat',
      component: Chat
    },
  ]
})

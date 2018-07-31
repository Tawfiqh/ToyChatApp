import Vue from 'vue'
import Router from 'vue-router'
import Chat from './views/Chat.vue'
import GraphDemo from './views/GraphDemo.vue'
import GraphChat from './views/GraphChat.vue'
import Users from './views/Users.vue'

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
    {
      path: '/graph-demo',
      name: 'graphDemo',
      component: GraphDemo
    },
    {
      path: '/graph-chat',
      name: 'graphChat',
      component: GraphChat
    },
    {
      path: '/users',
      name: 'Users',
      component: Users
    }
  ]
})

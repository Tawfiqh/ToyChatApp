import Vue from 'vue'
import Router from 'vue-router'
import Hello from './views/Hello.vue'
import Picker from './views/Picker.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'hello',
      component: Hello
    },
    {
      path: '/hello',
      name: 'hello',
      component: Hello
    },
    {
      path: '/picker',
      name: 'picker',
      component: Picker
    },

  ]
})

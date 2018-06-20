import Vue from 'vue'
import App from './App.vue'
import router from './router'
import _ from 'lodash';

Vue.config.productionTip = process.env.NODE_ENV === 'production'

Object.defineProperty(Vue.prototype, '_', { value: _ });


new Vue({
  router,
  render: h => h(App)
}).$mount('#app');

// Now the app has started!

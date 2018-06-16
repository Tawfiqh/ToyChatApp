import Vue from 'vue'
import App from './App.vue'
import router from './router'
import _ from 'lodash';

Vue.config.productionTip = false

Object.defineProperty(Vue.prototype, '_', { value: _ });

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');

// Now the app has started!

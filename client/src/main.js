import Vue from 'vue'
import App from './App.vue'
import router from './router'
import _ from 'lodash';
import Axios from 'axios';
import Vuex from 'vuex';
import store from './store';

Vue.use(Vuex);

Vue.config.productionTip = process.env.NODE_ENV === 'production'

Object.defineProperty(Vue.prototype, '_', { value: _ });
Object.defineProperty(Vue.prototype, 'axios', { value: Axios });


new Vue({
  router,
  render: h => h(App),
  store
}).$mount('#app');

// Now the app has started!

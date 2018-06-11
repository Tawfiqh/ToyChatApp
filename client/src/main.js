import Vue from 'vue'
import App from './App.vue'
import _ from 'lodash';


Vue.config.productionTip = false


Object.defineProperty(Vue.prototype, '_', { value: _ });

new Vue({
  el: '#app',
  render: h => h(App)
});

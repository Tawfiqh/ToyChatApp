import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    visitors: []
  },
  mutations: {
    addVisitor (state, visitor){
      if (!visitor) return;
      if (state.visitors.indexOf(visitor) > -1) return;

      state.visitors.push(visitor);
    }
  },
  getters :{
    uniqueVisitors: state => {
      return state.visitors.length;
    },
    firstVisitor: state =>{
      if (state.visitors.length == 0){
        return null;
      }

      return state.visitors[0];

    },
    lastVisitor: state =>{
      const noOfVisitors = state.visitors.length;
      if (noOfVisitors == 0){
        return null;
      }

      return state.visitors[noOfVisitors - 1];
    }
  },
  plugins: [ createPersistedState({ key: process.env.STORAGE_PREFIX }) ]
})

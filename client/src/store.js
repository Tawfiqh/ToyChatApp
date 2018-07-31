import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';
import axios from 'axios';
import createPersistedState from 'vuex-persistedstate';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    visitors: [],
    userName: null
  },
  mutations: {
    addVisitor (state, visitor){
      if (!visitor) return;
      if (state.visitors.indexOf(visitor) > -1) return;

      state.visitors.push(visitor);
    },
    setUserName(state, newName){
      state.userName = newName;
    },
    empty (state){
      state.visitors = [];
    }
  },
  actions: {
    async setNewUserName(context){

      const endpoint = `${process.env.VUE_APP_BASE_URL}${process.env.VUE_APP_GRAPH_URL}`;
      var body = { "query": "{newUser{ name }}" };
      const { data } = await axios.post( endpoint, body );

      var newName = _.get(data, "data.newUser.name", "⛱ folk_theater🇲🇦" );

      context.commit('setUserName', newName);
      return newName;
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
    },
    longestName: state => {
      const noOfVisitors = state.visitors.length;
      if (noOfVisitors == 0){
        return null;
      }

      return state.visitors.reduce((a,b)=>{
        return _.toArray(a).length > _.toArray(b).length ? a : b;
      });
    }
  },
  plugins: [ createPersistedState({ key: process.env.STORAGE_PREFIX }) ]
})

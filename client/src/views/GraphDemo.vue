<template>
  <div id="chat" >
    <h1> GraphQuery! </h1>
    <h3>{{ query }}</h3>



  </div>

</template>

<script>

export default {
  name: 'GraphDemo',

  data: () => ({

    query: "hi",
  }),
  methods:{


  },
  async mounted() {
                      // ${process.env.VUE_APP_BASE_URL}
                      // ${process.env.VUE_APP_BASE_URL}
    const endpoint = `${process.env.VUE_APP_BASE_URL}graph`;
    var body = { "query": "{getUsers{name age}}" };
    const { data } = await this.axios.post( endpoint, body );

    this.query = data["data"];

  },
  beforeDestroy() {

  }
}



</script>

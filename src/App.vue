<template>
  <div id="nav">
    <span v-for="route in routes" :key="route.name" >
      <router-link :to="route.path">{{route.name}}</router-link> |
    </span>
  </div>
  <hr>
  <router-view/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {routes} from "@/router";

export default defineComponent({
  data:()=>({
    routes
  })

});
</script>


<style lang="scss">
html {
  background-color: #2c3e50;
  //color: #fff;
  height: 100vh;
}
body {
  height: 100%;
  padding: 0;
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #fff;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #fff;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>

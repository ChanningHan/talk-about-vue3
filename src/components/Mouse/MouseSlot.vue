<template>
  <slot :x="x" :y="y"></slot>
</template>

<script>
import {throttle} from "lodash";

let throttleUpdate;

  export default {
    data:()=>({
      x:0,
      y:0
    }),
    methods:{
      update(e){
        console.log('still on listening')
        this.x = e.pageX
        this.y = e.pageY
      }
    },
    beforeMount() {
      throttleUpdate = throttle(this.update,200).bind(this)
    },
    mounted() {
      window.addEventListener('mousemove',throttleUpdate)
    },
    unmounted() {
      window.removeEventListener('mousemove',throttleUpdate)
    }
  }
</script>
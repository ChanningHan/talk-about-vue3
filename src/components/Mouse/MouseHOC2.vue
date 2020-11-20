<template>
  <Mouse2 :x="x" :y="y"></Mouse2>
</template>

<script>
import Mouse2 from "@/views/Mouse/Mouse2";
import {throttle} from "lodash";

let throttleUpdate;

  export default {
    components: {
      Mouse2
    },
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
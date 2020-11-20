<template>
  <h2>AsyncComponent</h2>
</template>
<script lang="ts">
import {defineComponent, ref} from "vue"

export default defineComponent({
  props: {
    timeout:{
      type: Number,
      required: true
    }
  },
  async setup(props) {

    const sleep = (timeout: number) => {
      return new Promise(resolve => {
        setTimeout(resolve, timeout)
      })
    }

    await sleep(props.timeout)
  }
})
</script>
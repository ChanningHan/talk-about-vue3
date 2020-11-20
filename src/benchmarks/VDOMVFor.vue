<template>
  <div>
    <p class="text">static text</p>
    <p v-for="item of list" :key="item.id">
      <span>static text</span>
      <span>{{ item.message }}</span>
    </p>
  </div>
</template>


<script lang="ts">
import {defineComponent, reactive} from "vue"

export default defineComponent({
  setup() {
    const list = reactive([
      {
        id: 1,
        message: '111'
      },
      {
        id: 2,
        message: '222'
      },
      {
        id: 3,
        message: '333'
      },
    ])

    return {
      list
    }
  }
})
</script>
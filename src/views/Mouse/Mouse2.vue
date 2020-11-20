<template>
  <header>
    <h1>获取鼠标位置——HOC</h1>
  </header>

  <main>
    <span>(</span>
    <transition name="text" mode="out-in">
      <div :key="x" class="position">{{ x }}</div>
    </transition>
    <span>,</span>
    <transition name="text" mode="out-in">
      <div :key="y" class="position">{{ y }}</div>
    </transition>
    <span>)</span>
  </main>
</template>


<script lang="ts">
import {defineComponent} from "vue"


export default defineComponent({
  props:['x','y']
})

</script>

<style lang="scss" scoped>
  main {
    font-weight: bold;
    font-size: 24px;
    .position {
      margin: 8px;
      display: inline-block;
    }
  }


  .text-enter-from,
  .text-leave-to {
    transform: scale(1.3);
    opacity: 0.5;
  }

  .text-enter-active,
  .text-leave-active {
    transition: all 0.1s ease;
  }

</style>
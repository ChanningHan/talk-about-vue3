<template>
  <h1>快速排序</h1>
  <h2>
    {{ list }}
  </h2>
  <div>
    <button @click="ok = !ok">SORT</button>
  </div>
  <hr>
  <template v-if="ok">
    <QuickSort :list="list"></QuickSort>
  </template>
</template>

<script lang="ts">
import QuickSort from "@/components/QuickSort.vue";
import {defineComponent, ref} from "vue"
import {shuffle} from "lodash"

export default defineComponent({
  components: {
    QuickSort
  },
  setup() {
    const ok = ref(false)
    const list = ref<number[]>([])
    for (let i = 1; i < 20; i++){
      list.value.push(i)
    }
    list.value = shuffle(list.value)
    return {list, ok}
  }
})
</script>
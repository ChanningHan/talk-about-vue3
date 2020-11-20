<template>
  <quick-sort :list="left" v-if="left.length"></quick-sort>
  <span class="item">{{ flag }}</span>
  <quick-sort :list="right" v-if="right.length"></quick-sort>
</template>


<script lang="ts">
import {defineComponent, ref} from "vue"

export default defineComponent({
  name: 'quick-sort',
  props: ["list"],
  setup(props) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    const flag: number = props.list[0]
    const left = ref<number[]>([])
    const right = ref<number[]>([])

    setTimeout(() => {
      props.list.slice(1).forEach((item: number) => {
        item > flag ? right.value.push(item) : left.value.push(item)
      })
    }, 100)


    return {
      flag,
      left,
      right
    }
  }
})
</script>

<style lang="scss" scoped>
.item {
  margin: 8px;
  font-weight: bold;
  font-size: 24px;
  animation: items 0.5s ease;
}
@keyframes items {
  0% {
    font-size: 24px;
  }
  50% {
    font-size: 64px;
  }
  100% {
    font-size: 24px;
  }
}
</style>
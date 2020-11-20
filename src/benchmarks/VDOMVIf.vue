<template>
  <div>
    <p class="text">static text</p>
    <p v-if="ok">
      <span>static text</span>
      <span>{{ msg }}</span>
    </p>
  </div>
</template>


<script lang="ts">
import {defineComponent, ref} from "vue"

export default defineComponent({
  setup() {
    const ok = ref(true)
    const msg = ref('channing')

    return {
      ok, msg
    }
  }
})
</script>
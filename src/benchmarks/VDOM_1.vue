<template>
    <div id="content">
      <p class="text">static text</p>
      <p class="text">static text</p>
      <p class="text">{{ msg }}</p>
      <p class="text">static text</p>
      <p class="text">static text</p>
    </div>
</template>

<script lang="ts" setup>
import {ref} from "vue"

export const msg = ref('channing')
</script>

<template>
  <header>
    <h1 id="title">DMAI</h1>
  </header>
  <main>
    <div id="content">
      <p class="text">static text</p>
      <p class="text">static text</p>
      <p class="text">{{ msg }}</p>
      <p class="text">static text</p>
      <p class="text">static text</p>
    </div>
  </main>
  <footer>
    <h1>@dmai-2020</h1>
  </footer>
</template>

<script lang="ts" setup>
import {ref} from "vue"

export const msg = ref('channing')
</script>

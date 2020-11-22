<template>
  <h1>Teleport——任意门</h1>
  <div class="customButton" @click="handleToggle">偷袭</div>
  <teleport to="body">
    <TeleportModal v-if="isOpen" @click="handleToggle"></TeleportModal>
  </teleport>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue"
import TeleportModal from "@/components/TeleportModal.vue"

export default defineComponent({
  components: {
    TeleportModal
  },
  setup() {
    const isOpen = ref(false)
    const handleToggle = () => {
      isOpen.value = !isOpen.value
    }

    return {
      isOpen,
      handleToggle
    }
  }
})
</script>

<style lang="scss" scoped>
.customButton {
  height: 64px;
  width: 128px;
  background-color: #fff;
  color: #42b983;
  text-align: center;
  line-height: 64px;
  font-size: 32px;
  border-radius: 32px;
  box-shadow: 0 0 16px rgba(255, 255, 255, 0.5);
  margin: 16px auto;
  cursor: pointer;
  user-select: none;
  font-weight: bold;

  &:active {
    box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.5);
  }
}
</style>
<template>
  <div
      camera="PerspectiveCamera"
      :cameraPos={z:1}
      scene="Scene"
      geometry="BoxGeometry"
      :geometryArg="[0.2,0.2,0.2]"
      material="MeshNormalMaterial"
      mesh="Mesh"
      :meshY="y"
      :meshX="x"
  >
  </div>

</template>

<script>
import {ref, computed} from 'vue'
import useMousePosition from "./useMousePosition";

export default {
  setup() {
    const {x: mouseX, y: mouseY} = useMousePosition()
    const x = computed(() => (mouseY.value)/200)
    const y = computed(() => (mouseX.value)/200)
    return {x,y}
  }
}
</script>
<style>

body {
  padding: 0;
  margin: 0;
  overflow: hidden;
}
</style>
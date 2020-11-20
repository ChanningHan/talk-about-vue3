<template>
  <VDOM_1></VDOM_1>
  <hr>
  <VDOMVIf></VDOMVIf>
  <hr>
  <VDOMVFor></VDOMVFor>
</template>
<script>
import VDOM_1 from "@/benchmarks/VDOM_1"
import VDOMVIf from "@/benchmarks/VDOMVIf";
import VDOMVFor from "@/benchmarks/VDOMVFor";
export default {
  components:{
    VDOM_1,
    VDOMVIf,
    VDOMVFor
  }
}
</script>
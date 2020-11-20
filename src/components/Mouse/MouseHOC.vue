<script>
import Mouse2 from "@/views/Mouse/Mouse2.vue";

import { defineComponent } from "vue";
import { throttle } from "lodash";

let throttleUpdate;

export default defineComponent({
  render() {
    return (
        <Mouse2 x={this.x} y={this.y}/>
    );
  },
  data: () => ({
    x: 0,
    y: 0,
  }),
  methods: {
    update(e) {
      this.x = e.pageX;
      this.y = e.pageY;
    },
  },
  beforeMount() {
    throttleUpdate = throttle(this.update, 200).bind(this);
  },
  mounted() {
    window.addEventListener("mousemove", throttleUpdate);
  },
  unmounted() {
    window.removeEventListener("mousemove", throttleUpdate);
  },
});
</script>

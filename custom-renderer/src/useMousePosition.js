import {ref, onMounted, onUnmounted} from "vue"
import {throttle} from "lodash"

export default function useMousePosition() {

    const x = ref(0)
    const y = ref(0)

    const update = throttle((e) => {
        x.value = e.pageX
        y.value = e.pageY
    }, 0)

    onMounted(() => {
        window.addEventListener('mousemove', update)
    })
    onUnmounted(() => {
        window.removeEventListener('mousemove', update)
    })

    return { x, y }
}
import {ref, onUnmounted} from "vue"

export default function useLoading() {
    const loading = ref("")
    let index = 0;
    const strArr = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]

    const interval = setInterval(() => {
        loading.value = strArr[index]
        index = (index + 1) % strArr.length
    },48)

    onUnmounted(() => {
        clearInterval(interval)
    })

    return {
        loading
    }

}
import {Visibility} from "@/Types/TodoMVC";
import {Ref, onMounted} from "vue"

export default function useHashChange(filters: any, visibility: Ref<Visibility>) {
    const onHashChange = () => {
        const visibility_hash = window.location.hash.replace(/#\/?/, "") as Visibility;

        if (filters[visibility_hash]) {
            visibility.value = visibility_hash
        } else {
            window.location.hash = "";
            visibility.value = "all";
        }
    }

    window.addEventListener("hashchange", onHashChange);
    onMounted(() => {
        onHashChange();
    })
}
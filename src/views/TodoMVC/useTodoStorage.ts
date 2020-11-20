import {Todo} from "@/Types/TodoMVC";
import {ref, watchEffect} from "vue"


export default function useTodoStorage() {

    const STORAGE_KEY = 'TodoMVC——Vue3.0'


    // 获取LocalStorage中的数据
    const fetch = (): Todo[] => JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    // 数据存储到LocalStorage中
    const save = (todos: Todo[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    }

    const uid = ref(~~(localStorage.getItem('uid') || 0));
    watchEffect(() => {
        localStorage.setItem('uid', uid.value.toString())
    })


    return {
        fetch,
        save,
        uid
    }


}
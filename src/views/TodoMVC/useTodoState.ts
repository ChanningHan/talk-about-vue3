import { Todo, Visibility } from "@/Types/TodoMVC";
import { ref, watchEffect, } from "vue"
import useTodoStorage from "@/views/TodoMVC/useTodoStorage";

export default function useTodoState() {

    const { fetch, save, uid } = useTodoStorage()

    // 全部事项
    const todos = ref(fetch())

    // 即将新增事项的内容
    const newTodo = ref("")

    // 新增代办事项
    const addTodo = () => {
        const value = newTodo.value && newTodo.value.trim()
        if (!value) {
            return;
        }
        todos.value.push({
            id: uid.value,
            title: value,
            completed: false
        })
        uid.value += 1
        newTodo.value = ""
    }

    // 删除代办事项
    const removeTodo = (todo: Todo) => {
        todos.value.splice(todos.value.indexOf(todo), 1)
    }


    // 使用todos.value的副作用去动态保存代办事项到本地缓存中
    watchEffect(() => {
        save(todos.value)
    })

    // 当前筛选的类型（url的hash值与此值一致）
    const visibility = ref<Visibility>("all")


    return {
        todos,
        newTodo,
        visibility,
        addTodo,
        removeTodo
    }


}
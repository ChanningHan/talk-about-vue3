import { Todo, Visibility } from "@/Types/TodoMVC";
import { ref, watchEffect, } from "vue"
import useTodoStorage from "@/views/TodoMVC/useTodoStorage";

export default function useTodoState() {

    const { fetch, save, uid } = useTodoStorage()

    const todos = ref(fetch())
    const newTodo = ref("")

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

    const removeTodo = (todo: Todo) => {
        todos.value.splice(todos.value.indexOf(todo), 1)
    }


    watchEffect(() => {
        save(todos.value)
    })

    const visibility = ref<Visibility>("all")



    return {
        todos,
        newTodo,
        visibility,
        addTodo,
        removeTodo
    }


}
import {Todo, Visibility} from "@/Types/TodoMVC";
import {computed, Ref} from "vue"

export default function useFilterTodos(todos: Ref<Todo[]>, visibility: Ref<Visibility>) {


    const filters = {
        all: () => todos.value,
        active: () => todos.value.filter((todo: Todo) => !todo.completed),
        completed: () => todos.value.filter((todo: Todo) => todo.completed)
    }


    const filteredTodos = computed((): Todo[] => {
        return filters[visibility.value]()
    })

    const remaining = computed(() => filters.active().length)

    const allDone = computed({
        get: () => {
            return remaining.value === 0
        },
        set: (completed: boolean) => {
            todos.value.forEach(item => {
                item.completed = completed
            })
        }
    })

    const removeCompleted = () => {
        todos.value = filters.active();
    }


    return {
        filteredTodos,
        remaining,
        allDone,
        filters,
        removeCompleted,
    }


}
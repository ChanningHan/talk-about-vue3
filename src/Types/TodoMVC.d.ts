export interface Todo {
    id: number;
    title: string;
    completed: boolean;
}

export type Visibility = "all" | 'active' | 'completed'
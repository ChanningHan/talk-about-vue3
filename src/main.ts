import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')

import {funcA,msgA} from "@/benchmarks/TreeShaking2"

console.log(msgA)
// funcA()




// import TreeShaking1 from "@/benchmarks/TreeShaking1"
//
// console.log(TreeShaking1.msgA)
// TreeShaking1.funcA()
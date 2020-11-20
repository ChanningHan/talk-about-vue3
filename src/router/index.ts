import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import BenchMark from "@/views/Benchmark.vue"

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path:"/benchmark",
    name:'Benchmark',
    component:BenchMark
  },
  {
    path:"/benchmark3",
    name:'Benchmark3',
    component:()=>import("@/views/Benchmark3.vue")
  },
  {
    path:"/mouse",
    name:'Mouse',
    /*Mixins*/
    // component:()=>import("@/views/Mouse/Mouse.vue")

    /*HOC*/
    // component:()=>import("@/components/Mouse/MouseHOC.vue")

    /*Slot*/
    // component:()=>import("@/views/Mouse/Mouse3.vue")

    /*Composition*/
    component:()=>import("@/views/Mouse/Mouse4.vue")
  },
  {
    path:"/todoMVC",
    name:'TodoMVC',
    component:()=>import("@/views/TodoMVC/TodoMVC.vue")
  },
  {
    path:"/fragment",
    name:'Fragment',
    component:()=>import("@/views/Fragment.vue")
  },
  {
    path:"/suspense",
    name:'Suspense',
    component:()=>import("@/views/Suspense.vue")
  },
  {
    path:"/teleport",
    name:'Teleport',
    component:()=>import("@/views/Teleport.vue")
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

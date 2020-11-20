<template>
  <div>
    <h1>Vue {{ items.length }} Components</h1>
<!--    <p>{{ action }} took {{ time }} ms.</p>-->
<!--    <p>-->
<!--      averageTime:{{ averageTime }} ms-->
<!--    </p>-->
    <button @click="shuffle">shuffle</button>
    <button @click="update">update</button>
    <button @click="autoRun">autoRun</button>
    <ul class="col-row" v-for="(item) in items" :key="item.id">
      <li class="col-md-1">
        channing
      </li>
      <li class="col-md-1">
        channing
      </li>
      <li class="col-md-1">
        channing
      </li>
      <li class="col-md-1">
        channing
      </li>
      <!--      <li class="col-md-1" :style="{boxShadow:index%2!==0?'0 0 8px rgba(0,0,0,0.55)':''}">-->
      <!--      <li class="col-md-1">-->
      <!--        <div :class="spanWrapperClass"><span >channing</span></div>-->
      <!--      </li>-->
      <li class="col-md-1">
        <div><span :style="{color}" :id="item.id">{{ item.label }}</span></div>
      </li>
    </ul>
  </div>
</template>

<script>
import {shuffle} from 'lodash'

const total = 1000
const items = []
for (let i = 0; i < total; i++) {
  items.push({
    id: i,
    label: String(Math.random()).slice(0, 5)
  })
}
let s = window.performance.now()
console.log('start:', s)

export default {
  data() {
    return {
      total: total,
      startTime: s,
      endTime: 0,
      time: 0,
      action: 'init',
      items: items,
      selected: null,
      actions: ['删除', '更新'],
      color: '#000',
      spanWrapperClass: 'spanWrapperClass1',
      testLog: [],
    }
  },
  computed: {
    averageTime() {
      return this.testLog.length > 0 ? this.testLog.reduce((total, currentValue) => total += currentValue) / this.testLog.length : 0
    }
  },
  beforeMount() {
    console.log('mounted:', window.performance.now())
    this.endTime = performance.now()
    this.time = this.endTime - this.startTime
    console.log('init took :', this.endTime - this.startTime)
  },
  // beforeUpdate() {
  //   console.log('hi')
  //   this.time = performance.now() - this.startTime
  //   this.testLog.push(this.time)
  // },
  methods: {
    autoRun() {
      for (let i = 1; i <= 10; i++) {
        setTimeout(() => {
          this.shuffle()
        }, i * 800)
      }
    },
    update() {
      this.color = `#${~~(Math.random() * 1000)}`
      this.spanWrapperClass = `spanWrapperClass${~~(Math.random() * 3 + 1)}`
    },
    shuffle() {
      this.startTime = performance.now()
      this.action = 'shuffle'
      s = window.performance.now()
      this.items = shuffle(this.items)
      this.update()
      this.$nextTick(()=>{
        // this.time = performance.now() - this.startTime
        this.time = performance.now() - this.startTime
        this.testLog.push(this.time)
      })
    }
  }
}

</script>
<style scoped lang="scss">
.spanWrapperClass1 {
  width: 100%;
  background-color: #42b983;
}

.spanWrapperClass2 {
  width: 100%;
  background-color: #777777;
}

.spanWrapperClass3 {
  width: 100%;
  background-color: #4078c0;
}

ul {
  li {
    div {
      display: inline-block;
    }
  }
}

.col-md-1 {
  font-weight: bold;
  padding: 6px 13px;
  border: 1px solid #ddd;
  flex: 1;
}

.col-row {
  display: flex;
  display: -webkit-flex;
  list-style: none;
  margin: 0;
  padding: 0
}

.col-row:nth-child(2n) {
  background-color: #f8f8f8;

}
</style>

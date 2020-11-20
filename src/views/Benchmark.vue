<template>
  <div>
    <h1>Vue {{ items.length }} Components</h1>
    <button @click="shuffle">shuffle</button>
    <button @click="update">update</button>
    <button @click="autoRun">autoRun</button>
    <button @click="showReport">report</button>
    <div class="col-row" v-for="(item) in items" :key="item.id">
      <div :class="[spanWrapperClass,'col-md-1']">
        <div>
          <span>static</span>
        </div>
      </div>
      <div class="col-md-1">
        <div>
          <span>static</span>
        </div>
      </div>
      <div class="col-md-1">
        <div>
          <span>static</span>
        </div>
      </div>
      <div class="col-md-1" >
        <div :class="spanWrapperClass">
          <span :style="{color}" :id="item.id" >{{item.label}}</span>
        </div>
      </div>
      <div class="col-md-1">
        <button @click="updateSingle(item)">更新</button>
      </div>
    </div>
  </div>
</template>

<script>
// import {shuffle} from 'lodash'

const total = 1000
const items = []
for (let i = 0; i < total; i++) {
  items.push({
    id: i,
    label: String(Math.random()).slice(0, 5)
  })
}
let start = window.performance.now()
let initialRender = 0;
let mount = 0;
let totalMount = 0;
let updateRender = 0;
let updatePatch = 0;
// let runsTotal = 0;
// let averageRender = 0;
// let averagePatch = 0;
// let averageTotal = 0;
const updateRenderLogs = []
const updatePatchLogs = []

export default {
  data() {
    return {
      items,
      color: '#000',
      spanWrapperClass: 'spanWrapperClass1',
      updateRenderLogs,
      updatePatchLogs
    }
  },
  beforeMount() {
    initialRender = performance.now() - start
  },
  mounted() {
    mount = performance.now() - start - initialRender
    totalMount = performance.now() - start
    console.log('initialRender:', initialRender)
    console.log('mount:', mount)
    console.log('totalMount:', totalMount)
    console.log('\r\n')
  },
  beforeUpdate() {
    updateRender = performance.now() - start
  },
  updated() {
    updatePatch = performance.now() - start
    updateRenderLogs.push(updateRender)
    updatePatchLogs.push(updatePatch)
    // console.log('updateRender:', updateRender)
    // console.log('updatePatch:', updatePatch)
  },
  methods: {
    showReport(){
      console.log('hi')
      this.updateRenderLogs = updateRenderLogs
      this.updatePatchLogs = updatePatchLogs
      console.log('averageRender:', updateRenderLogs.reduce((total, val) => total += val)/updateRenderLogs.length)
      console.log('averagePatch:', updatePatchLogs.reduce((total, val) => total += val)/updatePatchLogs.length)
    },
    updateSingle(e){
      start = performance.now()
      e.label = String(Math.random()).slice(0, 5)
    },
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
      this.items.forEach((item,index)=>{
        if(index%3 === 0){
          item.label = String(Math.random()).slice(0,5)
        }
      })
    },
    shuffle() {
      start = performance.now()
      // this.items = shuffle(this.items)
      this.update()
    }
  }
}

</script>
<style scoped lang="scss">
.spanWrapperClass1 {
  width: 100%;
  background-color: #42b983;
  color: white;
}

.spanWrapperClass2 {
  width: 100%;
  color: white;
  background-color: #777777;
}

.spanWrapperClass3 {
  width: 100%;
  color: white;
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

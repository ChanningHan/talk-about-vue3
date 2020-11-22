import { createRenderer } from '@vue/runtime-dom'
import * as THREE from 'three'

let webGLRenderer

// Three.js相关
function draw(obj) {
    const {camera,cameraPos, scene, geometry,geometryArg,material,mesh,meshY,meshX} = obj
    if([camera,cameraPos, scene, geometry,geometryArg,material,mesh,meshY,meshX].filter(v=>v).length<9){
        return
    }
    let cameraObj = new THREE[camera]( 40, window.innerWidth / window.innerHeight, 0.1, 10 )
    Object.assign(cameraObj.position,cameraPos)

    let sceneObj = new THREE[scene]()

    let geometryObj = new THREE[geometry]( ...geometryArg)
    let materialObj = new THREE[material]()

    let meshObj = new THREE[mesh]( geometryObj, materialObj )
    meshObj.rotation.x = meshX
    meshObj.rotation.y = meshY
    sceneObj.add( meshObj )
    webGLRenderer.render( sceneObj, cameraObj );
}

const { createApp } = createRenderer({
      insert: (child, parent, anchor) => {
          if(parent.domElement){
              draw(child)
          }
      },
      createElement:(type, isSVG, isCustom) => {
          alert('hi Channing~')
          return {
              type
          }
      },
      setElementText(node, text) {},
      patchProp(el, key, prev, next) {
          el[key] = next
          draw(el)
      },
      parentNode: node => node,
      nextSibling: node => node,
      createText: text => text,
      remove:node=>node
});


// 封装一个自定义的createApp方法
export function customCreateApp(component) {
  const app = createApp(component)
  return {
    mount(selector) {
        webGLRenderer = new THREE.WebGLRenderer( { antialias: true } );
        webGLRenderer.setSize( window.innerWidth, window.innerHeight );
        const parentElement =  document.querySelector(selector) || document.body
        parentElement.appendChild( webGLRenderer.domElement );
        app.mount(webGLRenderer)
    }
  }
}


# 写在开头

>大家好，我是**Channing**。<br><br>
>上周五刚在部门里做完了关于Vue3的技术分享，前后大概花了整整一个星期的时间和精力去准备里面的内容，遂想在周末的时间里把这些重新再整理成文字也分享给掘友们。<br><br>
>或许有些部分不绝对专业，但绝对乐于接受合理的意见和建议。<br><br>
>本文主体脉络分为三个部分：**`Vue3重写的动机`**、**`优化的原理`**，以及Vue3带来了什么 **`值得一看的新东西`**。<br><br>
>内容方面具体的划分为如下脑图所示：
>![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a0e368b335d14e2cb4f785cf7f7e82b4~tplv-k3u1fbpfcp-watermark.image)






# Why——重写的动机？

更专业可见尤大亲笔：[The process: Making Vue 3](https://increment.com/frontend/making-vue-3)

重写的动机主要分为两点：

1. **使用新的JS原生特性**
2. **解决设计和体系架构的缺陷**

##  使用新的JS原生特性

随着前端标准化的发展，目前主流浏览器对很多JS新特性都普遍支持了，其中一些新特性不仅解决了很多技术上的实现难题，还带来了更好的性能提升。

在Vue3中，最重要也更为人所知的就是ES6的**Proxy**。

Proxy不仅消除了Vue2中现有的限制（比如对象新属性的增加、数组元素的直接修改不会触发响应式机制，这也是很多新手以为所谓的bug），而且有着更好的性能：

我们知道，在Vue2中对数据的侦听劫持是在组件初始化时去遍历递归一个对象，给其中的每一个属性用Object.defineProperty设置它的getter和setter，然后再把处理好的这些对象挂到组件实例的this上面，所以这种方式的数据侦听是在属性层面的，这也是为什么增加对象属性无法被监听的原因，同时这种初始化的操作对于CPU来说还是比较昂贵的一个操作。对于javascript而言，一个对象肯定越稳定越小性能就越好。

使用Proxy之后组件的初始化就不需要这么做这么费时的操作了，因为Proxy就是真正意义给一个对象包上一层代理从而去完成数据侦听劫持的操作，所以总的来说这个复杂度是直接少了一个数量级的。只要你对这个代理后的对象访问或修改里面的东西都能被这层代理所感知到，进而去动态地决定返回什么东西给你，并且也不再需要把选项的这些东西再重复挂到组件实例的this上面，因为你访问的时候是有这个信息知道你访问的东西是属于props还是data还是其他的，vue只需要根据这个信息去对应的数据结构里面拿出来就可以了，单就这一点而言你就可以感觉到组件的内存占用已经少了一半。

由于proxy是在对象层面上的代理，所以你在对象上新增属性是可以被代理到的。

另外Proxy还可以代理数组，所以就算你直接修改数组里面的元素也是可以被代理到的。

但是，对于传统的浏览器——IE，就连IE11也还没有支持Proxy这个东西，又由于Proxy是原生的ES6特性，所以目前还无法通过polyfill来兼容IE（Vue3也正在做这一块的兼容）.....这个东西也确实拿他没辙，否则当初React升级到15、Vue2.X也不会抛弃IE8了。尤大在去年的VueConf上还很形象地吐槽了IE——百足之虫，死而不僵。

IE耗子尾汁吧。

## 解决设计和体系架构的缺陷

随着Vue2使用和维护过程，逐渐暴露出来了一些设计和体系架构上的缺陷，主要有：

1. 框架内部模块的耦合问题
2. TypeScript的支持不好
3. 对于大规模应用的开发体验不好

那么在Vue3中是如何逐一解决这些问题的？

### 1. 解耦内部包

首先，看过Vue2源码的朋友们应该比较深有感触，单一地理解框架源码是非常痛苦的。

这个表现为各个模块内部的高度耦合和看上去似乎不属于任何地方的浮动代码的隐式耦合，这也让源码的维护和扩展在社区中变得困难重重。

也由于内部模块的耦合，对于一些资深的高级用户（比如库作者）在构建更高级别的渲染器时不得不把整个框架的代码引入进来。我们在看Vue2源码的时候或许会注意到里面还有Weex，这个是由于Weex是与Vue官方合作的一个多端渲染框架，而Vue2中为了支持这个能力又受限于现有架构，不得不分叉代码库并且复制大量的框架代码进去，更惨的像mpVue这种非官方合作的，就只能手动拉整个Vue的分支代码下来。

为了解决这个问题，Vue3重写时采用了**monorepo**的设置，把原来的各个模块拆分出来，整个框架再由这些低耦合的内部包组成，每个包都有自己的API、类型定义、测试程序等等。一方面让开发人员可以更容易地阅读、理解甚至可以放心地大范围修改这些模块包。

另一方面还给予了用户将其中的一些包单独拿出去用的能力，比如你可以把**reactivity**这个包也就是响应式系统拿出去用于需要用到响应式的场景，也可以用这个包去搭一个自己的玩具框架等等都是可以的。



### 2.使用TypeScript重写以及设计类型友好的新API

讲到**TypeScript**，这应该也是我们比较关注的一个问题。

首先Vue2最初是使用纯JS写成的，但后来意识到一个类型系统将对这样大型规模的项目是非常必要的，尤其体现在重构或者扩展，类型检查将很大程度地减少这个过程中引入意外错误的机会，也让更多代码贡献者可以更大胆放心地进行大范围的更改。

所以Vue2当时引入了Fackbook的**Flow**进行静态类型检查，一方面是因为它可以渐进地添加到现有的纯JS项目中，但可惜的是Flow虽然有一定的帮助但是并没有期望中那么香，最离谱的是谁能想到连Flow自己也都烂尾了，可以上Flow的官网看看，这玩意到现在还是0.X的版本，相比TypeScript的飞速发展以及TS与开发工具的深度集成尤其是VSCode，Flow真的是一言难尽好吧。不可否认，尤大自己也说自己当初是压错宝了。

也由于TS的蓬勃发展，越来越多的用户也在Vue中使用TS，而对Vue来说，同时支持两个类型系统是一件比较麻烦的事情，并且在类型推导上变得非常困难。如果源代码切换到TS也就没那么多屁事了。

其次，之所以Vue2对TS的支持一塌糊涂，也是因为**Options API**与类型系统之间是存在**断层**的。

Vue的API设计开始并没有针对语言本身的机制和类型系统去设计，部分原因也是Vue开始写的时候js中甚至还没有类型系统这个玩意。

vue组件实例本质上就是个包含了一个个描述组件选项属性的对象，这种设计的好处就是更符合人类的直觉，所以这也是为什么它对于新手来说更好理解和容易上手。

但是这种设计的缺陷就是跟TypeScript这样的类型系统存在一个“断层”，这个断层怎么说呢，对于不用类型系统只关注业务逻辑的用户来说是感知不到的。

Vue2中的optionsAPI是一个看似面向对象但是实际上却有一定偏差，这就导致了它不够类型友好，尤其是对于选项来说，类型推导是比较困难的。

但这个断层其实也是双向的：你可以说是optionsAPI的设计不够类型友好，也可以说TS还不够强大不能给Vue提供足够好的类型支持。

举个栗子，正如**JSX**一开始也是没有类型支持的，完全是因为TypeScript强行给加了一整套针对JSX的类型推导机制才给了TSX现在的开发体验。所以可以这么理解，如果TypeScript当时因为JSX不属于真正的JS规范而不给它提供支持，是不是也可以说React的设计跟类型系统存在着断层呢？

那么如何在Vue中去抹平这个断层呢？一个很直接的方法就是重新设计一个类型友好的API。这个方法说起来很简单，但是对Vue来说改一个API是需要考虑很多东西的：

1. 与原有API的**兼容性**：能否同时支持新旧API？旧的用户又如何升级？像Angular2当时那样直接改的面目全非当然比较简单，但说直接点就是不管旧版本用户的死活，下场大家也清楚。现在主流的框架大版本升级都开始在版本兼容上足够重视或者下了大功夫，比如十月份正式发布的**React17**，这个版本没有任何新的用户层面的API，但其中一个有意思的新特性就是让一个React应用可以同时加载多个React版本，使得旧版本可以逐步升级。

2. 如何设计出既能提供良好的类型推导，又不让类型推导而做的设计影响到非TS用户的开发体验？如何在TS和非TS的使用体验中做到一个最好的**平衡**和**一致性**？像Angular那样不管非TS的用户当然也是比较简单的，但是Vue不会这么做。

我们回顾一下Vue2里面是怎么去使用TypeScript的：

在Vue2中使用过TypeScript的话我们基本对这两个社区方案比较熟悉了——**vue-class-component**和**vue-property-decorator**。

这两个方案都是基于**Class**实现的，那么Vue3要做到类型友好，既然有了这么成熟的两个社区方案，在Vue3中继续沿用这个方向，基于Class设计出一个更好用的API不就简单完事了吗？

确实，在Vue3的原型阶段甚至已经实现了新的**Class API**，但是后面又把这个API给删了。因为class的水真的是太深了。

首先，Class API依赖于fields、decorators等提案，尤其是decorators的提案真的是太多坑了，我们可以看看github上**TC39**关于**decorators提案**的讨论和进度：[https://github.com/tc39/proposal-decorators](https://github.com/tc39/proposal-decorators)。

这玩意目前仍有41个在讨论中的issue，在已关闭的167个issue中比较有意思的是之前**V8**团队出于性能考虑直接否决掉了decorators其中的一个提案，有个老哥在底下评论说球球不要因为这个提案也推翻之前的提案，因为社区中已经有很多人在使用了，比如**Ember**、**Angular**、**Vue**等等。

而decorators本身经历了这么长时间的争论，已经大改了好几次，但也仍然停留在**stage2**的阶段：

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8dfd6a354fc341b798c1001aecb4c901~tplv-k3u1fbpfcp-watermark.image)

stage2是什么概念？可以在TC39在About中贴出来的[文档]([tc39.github.io/process-document/](https://tc39.github.io/process-document/))中看到：

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fbabc61be2334b2097e8f45e23089f02~tplv-k3u1fbpfcp-watermark.image)

stage2意味着这个提案的东西随时可能会发生翻天覆地的变化，至少得进入**stage3**阶段才不会出现破坏性的改动。

那么现在TS里面的decorators还能用是因为**TS**实现的是decorators比较早期的一个版本，已经跟最新的decorators提案脱节了，期间decorators还经过了几次的大改。

另外，VueLoader里面用的**Babel**对decorators的实现和**TS**对decorators的实现又有不同，这在一些比较极端的用例里面可能就会踩坑了。

所以出于Class的**复杂性**和**不确定性**，这玩意在Vue3还是暂时不考虑了，并且Class API除了稍微好一点的类型支持以外也并没有带来其他的实用性。但是为了版本兼容，Vue3中也**仍然会支持**刚刚提到的两个社区方案。那么抛弃了Class API，要怎么去拥抱TypeScript呢？

事实上Class的本质就是一个函数，所以一个基于**function**的API同样可以做到类型友好，并且可以做得更好，尤其是函数中的参数和返回值都是对类型系统非常友好的，因此这个基于函数的API就应运而生了，也就是现在Vue3中的**Composition API**。



### 3. 解决开发大规模应用的需求

随着Vue被越来越广泛地采用，开发**大型项目**的需求也越来越多，对于这种类型的项目，首先需要的是一个像**TypeScript**这样的类型系统，还需要可以**干净地组织可重用代码的能力**。

巧妙的是，基于函数的**Composition API**，也叫做组合API，把这些需求全都给解决了，好家伙！对于Composition API我会在**第三部分**中再去进一步谈谈。

___





# How——如何优化？

关于优化，主要从两个方面谈谈：**如何更快**和**如何更小**。

## 如何更快？

>1. Object.defineProperty => **Proxy**
>2. 突破**Virtual DOM**瓶颈
>3. 更多**编译时优化**
>		* **Slot** 默认编译为函数
>
>  	* 模板静态分析生成VNode优化标记——**patchFlag**

### Object.defineProperty => Proxy

这部分我们刚刚已经讲过了，它不仅让内存占用变得更小，还让组件的初始化变得更快，那么有多快呢？

我搬运了**Vue3原型阶段**和**Vue2.5**的一个初始化性能测试对比图，测试的benchmark是**渲染3000个带状态的组件实例**：

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/86af0601fd2b4d60ab37d696d285b55b~tplv-k3u1fbpfcp-watermark.image)

可以看到，内存占用仅仅为Vue2的**一半**，初始化的速度快了将近**一倍**。

但是，还不够！

这只是初始化，我们看看组件**更新时**的优化。

### 突破Virtual DOM瓶颈

首先，我们看看传统的**Virtual DOM 树**是如何更新的：

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/27f1adfc011e4ec789f979a73a8ca7dc~tplv-k3u1fbpfcp-watermark.image)
当数据发生改变的时候，两棵vdom的树会进行**diff**比较，找到需要更新的节点再**patch**为实际的**DOM**更新到浏览器上。这个过程在Vue2中已经优化到了**组件**的粒度，通过渲染Watcher去准确找到需要更新的组件，将整个组件内的vdom tree进行diff。这个组件粒度的优化**React**也做到了，只不过这个优化的操作是交给了用户，比如利用**pureComponeng**、**shouldComponentUpdate**等等。

但组件的粒度还是相对比较粗的，于是Vue3**重写**了Virtual Dom，以利用**模板的静态分析**优势去将更新的粒度进一步缩小到**动态元素**甚至是**动态的属性**。

我们先看一个最简单的情况：

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d2346bba9dbf400988aedb5b0eb12ccb~tplv-k3u1fbpfcp-watermark.image)

在传统的Virtual DOM下的diff过程：
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cec7d42d8ed04cceb645a76f5d0c150f~tplv-k3u1fbpfcp-watermark.image)

我们可以看到，在这个模板下，整个组件节点的结构是**固定不变**的，而里面有夹杂很多完全静态的节点，只有一个节点的文本内容是动态的。而在传统的vdom下，仍然去遍历diff了这些完全不会发生变化的节点。虽然Vue2已经对这些完全静态的节点进行了优化标记以一种fastPath的方式去跳过这些静态节点的diff，但仍然存在一个遍历递归的过程。

那么在Vue3新的Virtual DOM下，会如何进行diff呢？

通过**compiler**对模板的静态分析，在优化模式下将静态的内容进行**hosting**，也就是把静态节点提升到外面去，实际生成**vnode**的就只有动态的元素`<p class="text">{{ msg }}</p>`，再分析这个元素内可能发生变化的东西，对这个元素打上**patchFlag**，表示这个元素可能发生变化的**类型**是文本内容textContent还是属性类class等等。

我们看看模板编译为**render**函数后的结果：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e1cbfb548b1a449b9ca2f0eb67de7900~tplv-k3u1fbpfcp-watermark.image)

可以看到，**完全静态**的元素已经被提升到render函数上面去了，实际会创建**vnode**的就只有一个含有动态文本内容的p元素。

所以在新的Virtual DOM下，这个组件的diff过程就变成了：

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/164b6f0f9ad3426c9a9e0bde9a635963~tplv-k3u1fbpfcp-watermark.image)

肉眼可见的，这是一个数量级的优化。

那么刚刚说了，这是一个组件节点结构完全固定的情况，那么也就有另一种情况：**动态节点**。

而在Vue的模板中，出现动态节点的情况就只有**两种**：

1. **v-if**
2. **v-for**

#### 先看**v-if**：

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4bc43ca23eb140c290487eabb6e2da11~tplv-k3u1fbpfcp-watermark.image)

我们可以看到，在v-if内部，节点结构又是**完全固定**的，并且只有`{{ msg }}`是动态节点。所以如果把v-if划分为一个**区块Block**的话，又变成了我们上一个看的那种情况。因此，只要先将整个模板看作一个Block，然后以动态指令进行划分一个个嵌套的Block，每个Block就都变成最简单的那种情况了：


![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0b6f29c898884e26abaffe5c647f2200~tplv-k3u1fbpfcp-watermark.image)

并且每个Block里面的**动态元素**只需要以一个简单的打平的**数组**去记录跟踪即可。所以diff的过程就只是遍历递归去找那些存在动态节点的Block，根据这些动态Block中的一个数组就可以完成diff的过程。

所以刚刚这个v-if的例子的新diff过程就是：
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d2e608e109934957a5154fd8f26016be~tplv-k3u1fbpfcp-watermark.image)



#### v-for也是相同的原理，将v-for划分为一个Block：

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7a11db4244c3488897db645642f55042~tplv-k3u1fbpfcp-watermark.image)

只有 v-for 是**动态节点** ，每个 v-for 循环内部：只有 {{ item.message }} 是动态节点。它的diff过程：

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/28ca3020092d4aa784219fbdfce5a67f~tplv-k3u1fbpfcp-watermark.image)




#### 总结：

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4bcf720f636a4ef5a219a754cc37f894~tplv-k3u1fbpfcp-watermark.image)
* 将模版基于**动态节点指令**切割为嵌套的**区块**
* 每个区块内部的节点结构是**固定**的
* 每个区块只需要以一个**平面数组**追踪自身包含的**动态节点**



所以Virtual DOM的更新性能从与**模板整体大小**相关，提升到了只与**动态内容的数量**相关：

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c05dc8201b43444cb51429bea51fa563~tplv-k3u1fbpfcp-watermark.image)

### 更多编译时优化

* **Slot**默认编译为**函数**

  这个让使用插槽的父子组件之间的**更新关系**不再强耦合

* 利用模板**静态分析**对vnode生成的类型标记——**patchFlag**

  这一点我们刚刚也讲到了，对于**pacthFlag**的定义，我们可以去源码中看看（为了方便截图，我删了部分的注释，以及标注了前几个的类型的二进制值出来）：
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b24edb6892af425f9dea51148873239b~tplv-k3u1fbpfcp-watermark.image)

**<<** 就是左移操作符，我们可以看到一共有**十个**动态的**类型**，每个类型的数值都是在1的基础上移动不同位数得到的，所以一个十一位的**二进制数**就描述了vnode的**动态类型**。并且尤大非常友好地告诉我们了这个怎么用：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/769ac4b9488b49b5a70e406c797fb252~tplv-k3u1fbpfcp-watermark.image)

vnode的patchFlag通过 **|** 操作符去组合起来，vnode的patchFlag和某个特定类型所代表的patchFlag就用 **&** 操作符计算一下，如果得到的结果为**0**，则说明这个vnode的这个类型的属性是**不会变**的，**不为0则相反**。还引导了你去`renderer.ts`下看看怎么使用的，不过他的路径似乎有点问题....我看的是`packages/runtime-core/src/renderer.ts`。但更深入的内容就不在这里展开了，感兴趣的话以后可以写一篇专门讲讲这个吧。

看到尤大这个操作的时候真的是惊了，写代码还能这么玩的啊？

然后灵光一闪，我寻思写**用户鉴权**好像也可以这么玩吧。

So，try it now：
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/466810954cab48d3b8c7b4a8f38b6fc0~tplv-k3u1fbpfcp-watermark.image)


还蛮有意思的~



言归正传，经过了这么层层优化，Vue3究竟**有多快**？

我去vue3.0 release时给出的数据[https://docs.google.com/spreadsheets/d/1VJFx-kQ4KjJmnpDXIEaig-cVAAJtpIGLZNbv3Lr4CR0/edit#gid=0](https://docs.google.com/spreadsheets/d/1VJFx-kQ4KjJmnpDXIEaig-cVAAJtpIGLZNbv3Lr4CR0/edit#gid=0) 中搬运了过来：
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/92aee9d99d4945b6bc05a9acfba9afb4~tplv-k3u1fbpfcp-watermark.image)

可以看到，与Vue2相比，Vue 3在bundle包大小**减少41%**、初始渲染**快了55%**、更新**快了133%** 和内存使用 **减少54%** 。

___

## 如何更小？

最主要的就是充分利用了**Tree-shaking**的特性，那么什么是Tree-shaking呢? 中文翻译过来就是抖树，我们来看看它的**工作原理**：

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/97c5313ab49f4f33861268407a78f3eb~tplv-k3u1fbpfcp-watermark.image)

小玩笑...

**MDN**上对Tree shaking的描述：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0a0c0e2bbde94d68a7d0768267186cbb~tplv-k3u1fbpfcp-watermark.image)

什么意思呢？为了更好地体会到它的作用，我们先看看两种**export**的写法：

第一种：

```javascript
const msgA = 'hhhh'

const msgB = 777

const funcA = () => {
    console.log('AAA')
}

const funcB = () => {
    console.log('BBB')
}

export default{
    msgA,
    msgB,
    funcA,
    funcB
};
```

第二种：

```javascript
export const msgA = 'hhhh'

export const msgB = 777

export const funcA = () => {
    console.log('AAA')
}

export const funcB = () => {
    console.log('BBB')
}
```

然后我在`main.ts`中分别引入并使用这两个模块：

第一种：

```javascript
import TreeShaking1 from "@/benchmarks/TreeShaking1"

console.log(TreeShaking1.msgA)
TreeShaking1.funcA()
```

第二种：

```javascript
import {funcA,msgA} from "@/benchmarks/TreeShaking2"

console.log(msgA)
// funcA()
```

build以后生成的`app.js bundle`：

第一种：
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8d52aa2300db47c98c8819fd11308367~tplv-k3u1fbpfcp-watermark.image)

第二种：

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3e767bd695224d3687d7e2f2ebf19f3a~tplv-k3u1fbpfcp-watermark.image)


我们可以看到，tree shaking以后，进入bundle的只有被引入并且**真正会被使用**的代码块。在Vue3中许多渐进式的特性都使用了第二种的写法来进行重写，而且**模板**本身又是Tree shaking友好的。

但不是所有东西都可以被抖掉，有部分代码是对任何类型的应用程序都不可或缺的，我们把这些不可或缺的部分称之为**基线大小**，所以Vue3尽管增加了很多的新特性，但是被压缩后的基线大小只有**10KB**左右，甚至不到Vue2的**一半**。

我把刚刚的两个demo所在的项目**build**以后：

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c0c4413355114b9cb36e5b6f56ac1023~tplv-k3u1fbpfcp-watermark.image)


可以看到这个**app.js**的bundle只有`9.68kb`，这还是包括了`router`在内的，而以往Vue2构建出来的普遍都在**20+kb**以上。





# What——新东西？

一起看看Vue3给我们带来了哪些值得关注的新东西。

## Composition API

首先当然是万众瞩目的Composition API。

为此，我搬运了然叔的一夜动画~

我们先回顾一下在Vue2中**OptionsAPI**是怎么写的：
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/165a0e8847954d6581fa913a02491d61~tplv-k3u1fbpfcp-watermark.image)

随着产品迭代，产品经理不断提出了新的需求：
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ea680e1cbce461e8ba46cdbc73dded0~tplv-k3u1fbpfcp-watermark.image)

由于相关业务的代码需要遵循option的配置写到**特定的区域**，导致后续**维护**非常的复杂，代码可**复用性**也不高。最难受的是敲代码的时候不得不上下**反复横跳**，晃得眼瞎...

用了**CompositionAPI**会变成什么样呢？
![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7f0b5f13172742c4a9a4136c2194176f~tplv-k3u1fbpfcp-watermark.image)

我们可以看到，功能相关的代码都聚合起来了，代码变得**井然有序**，不再频繁地上下反复横跳。但还差点意思，事实上，我们很多逻辑相关的操作是不需要体现出来的，真正需要使用到的可能只是其中的一些变量、方法，而Composition API带来的出色**代码组织和复用**能力，让你可以把功能相关的代码抽离出去成为一个可复用的函数JS、TS文件，在.vue文件中通过函数的调用把刚刚这些函数的返回值组合起来，最后返回模板真正需要使用到的东西：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fb018fe4950f4ca7abfe94986a78bb2a~tplv-k3u1fbpfcp-watermark.image)

巴适得很~

Composition API为何这么好用，得益于它的两个核心组成：

* Reactivity——**响应式系统**
* **生命周期钩子**

响应式系统暴露了更多底层的API出来，从而让我们很轻松地去创建使用响应式变量。然后结合暴露出来的生命周期钩子，基本就可以完成整个组件的逻辑运作。当然还可以结合更多的api完成更复杂的工作，社区也有很多关于CompositionAPI的使用技巧和方法，这一块就不去细化了，点到为止。



### 优势

对比**Class API**：

* 更好的 **TypeScript** 类型推导支持

  function对于类型系统是非常友好的，尤其是函数的参数和返回值。

* 代码更容易被**压缩**

  代码在压缩的时候，比如对象的key是不会进行压缩的，这一点可以从我们刚刚对于Three shaking demo构建出来的包就可以看得出来：

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/17e7687784084abd8cd49517eca2e199~tplv-k3u1fbpfcp-watermark.image)

  而composition API声明的一些响应式变量，就可以很安全地对变量名进行压缩。

* Tree-shaking 友好

  CompositionAPI这种引用调用的方式，构建工具可以很轻松地利用**Tree shaking**去消除我们实际未使用到 “死代码“

* 更灵活的**逻辑复用**能力

  在Vue2中，我们一直缺少一种很干净方便的逻辑复用方法。

  以往我们要想做到逻辑复用，主要有三种方式：

  1. 混入——**Mixins**
  2. 高阶组件——**HOC**
  3. **作用域插槽**

为了更好地体会这三种方法的恶心之处，我用一个简单的**demo**去分别演示这三种方法。

案例：**鼠标位置侦听**:

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/756a6f85f4db4835b76609dddb3ade80~tplv-k3u1fbpfcp-watermark.image)

先看看Mixins的方式：

#### Mixins

MouseMixin.js:

```javascript
import {throttle} from "lodash"

let throttleUpdate;

export default {
    data:()=>({
        x:0,
        y:0
    }),
    
    methods:{
        update(e){
            console.log('still on listening')
            this.x = e.pageX
            this.y = e.pageY
        }
    },
    
    beforeMount() {
        throttleUpdate = throttle(this.update,200).bind(this)
    },
    mounted() {
        window.addEventListener('mousemove',throttleUpdate)
    },
    unmounted() {
        window.removeEventListener('mousemove',throttleUpdate)
    }
}

```

使用：

```vue
<template>
  <header>
    <h1>获取鼠标位置——Mixins</h1>
  </header>

  <main>
    <span>(</span>
    <transition name="text" mode="out-in">
      <div :key="x" class="position">{{ x }}</div>
    </transition>
    <span>,</span>
    <transition name="text" mode="out-in">
      <div :key="y" class="position">{{ y }}</div>
    </transition>
    <span>)</span>
  </main>
</template>


<script>
import {defineComponent} from "vue"

import MouseMixin from "@/components/Mouse/MouseMixin.js";

export default defineComponent({
  mixins: [MouseMixin],
  components: {}
})
</script>
```

当大量使用mixin时：

* ❌ **命名空间冲突**
* ❌ **模版数据来源不清晰**

#### HOC——高阶组件

HOC在**React**使用得比较多，它是用来替代mixin的方案。事实上Vue也可以写HOC。

其原理就是在组件外面再包一层父组件，复用的逻辑在父组件中，通过**props**传入到子组件中。

看看这个带有可复用逻辑的**MouseHOC**怎么写：

```javascript
import Mouse2 from "@/views/Mouse/Mouse2.vue";

import { defineComponent } from "vue";
import { throttle } from "lodash";

let throttleUpdate;

export default defineComponent({
  render() {
    return (
        <Mouse2 x={this.x} y={this.y}/>
    );
  },
  data: () => ({
    x: 0,
    y: 0,
  }),
  methods: {
    update(e) {
      this.x = e.pageX;
      this.y = e.pageY;
    },
  },
  beforeMount() {
    throttleUpdate = throttle(this.update, 200).bind(this);
  },
  mounted() {
    window.addEventListener("mousemove", throttleUpdate);
  },
  unmounted() {
    window.removeEventListener("mousemove", throttleUpdate);
  },
});

```

HOC内部的子组件——Mouse2.vue：

```vue
<template>
  <header>
    <h1>获取鼠标位置——HOC</h1>
  </header>

  <main>
    <span>(</span>
    <transition name="text" mode="out-in">
      <div :key="x" class="position">{{ x }}</div>
    </transition>
    <span>,</span>
    <transition name="text" mode="out-in">
      <div :key="y" class="position">{{ y }}</div>
    </transition>
    <span>)</span>
  </main>
</template>

<script lang="ts">
import {defineComponent} from "vue"
export default defineComponent({
  props:['x','y']
})
</script>
```



同样，在大量使用HOC的时候的问题：

* ❌ **props 命名空间冲突**
* ❌ **props 来源不清晰**
* ❌ **额外的组件实例性能消耗**



#### 作用域插槽

原理就是通过一个**无需渲染**的组件——**renderless component**，通过**作用域插槽**的方式把可复用逻辑输出的内容放到`slot-scope`中。

看看这个无渲染组件怎么写：

```vue
<template>
  <slot :x="x" :y="y"></slot>
</template>

<script>
import {throttle} from "lodash";

let throttleUpdate;

  export default {
    data:()=>({
      x:0,
      y:0
    }),
    methods:{
      update(e){
        console.log('still on listening')
        this.x = e.pageX
        this.y = e.pageY
      }
    },
    beforeMount() {
      throttleUpdate = throttle(this.update,200).bind(this)
    },
    mounted() {
      window.addEventListener('mousemove',throttleUpdate)
    },
    unmounted() {
      window.removeEventListener('mousemove',throttleUpdate)
    }
  }
</script>
```

在页面组件`Mouse3.vue`中使用:

```vue
<template>
  <header>
    <h1>获取鼠标位置——slot</h1>
  </header>
  <main>
    <span>(</span>

    <MouseSlot v-slot="{x,y}">
      <transition name="text" mode="out-in">
        <div :key="x" class="position">{{ x }}</div>
      </transition>
      <span>,</span>
      <transition name="text" mode="out-in">
        <div :key="y" class="position">{{ y }}</div>
      </transition>
    </MouseSlot>

    <span>)</span>
  </main>
</template>

<script lang="ts">
import {defineComponent} from "vue"
import MouseSlot from "@/components/Mouse/MouseSlot.vue"

export default defineComponent({
  components: {
    MouseSlot
  }
})
</script>
```

当大量使用时：

* ✔ **没有命名空间冲突**
* ✔ **数据来源清晰**
* ❌ **额外的组件实例性能消耗**

虽然无渲染组件已经是一种比较好的方式了，但写起来仍然蛮恶心的。

所以，在Composition API中，怎么做到逻辑复用呢？

#### Composition API

暴露一个可复用函数的文件：`useMousePosition.ts`，这个命名只是让他看起来更像react hooks一些，一眼就能看出来这个文件这个函数是干什么的，实际上你定义为其他也不是不可以。

```typescript
import {ref, onMounted, onUnmounted} from "vue"
import {throttle} from "lodash"

export default function useMousePosition() {

    const x = ref(0)
    const y = ref(0)

    const update = throttle((e: MouseEvent) => {
        x.value = e.pageX
        y.value = e.pageY
    }, 200)

    onMounted(() => {
        window.addEventListener('mousemove', update)
    })
    onUnmounted(() => {
        window.removeEventListener('mousemove', update)
    })

    return { x, y }
}
```

页面组件`Mouse4.vue`中使用：

```vue
<template>
  <header>
    <h1>获取鼠标位置——Composition API</h1>
  </header>

  <main>
    <span>(</span>
    <transition name="text" mode="out-in">
      <div :key="x" class="position">{{ x }}</div>
    </transition>
    <span>,</span>
    <transition name="text" mode="out-in">
      <div :key="y" class="position">{{ y }}</div>
    </transition>
    <span>)</span>
  </main>
</template>


<script lang="ts">
import {defineComponent} from "vue"
import useMousePosition from "@/components/Mouse/useMousePosition";

export default defineComponent({
  setup() {
    const { x, y } = useMousePosition()
    return { x, y }
  }
})
</script>
```

即使在大量使用时：

* ✔ **没有命名空间冲突**
* ✔ **数据来源清晰**
* ✔ **没有额外的组件实例性能消耗**

**干净**、**清晰**。

除此之外，这种函数式也给予了优秀的**代码组织**能力。

为了演示这一点，我把Vue2示例中的`todoMVC`项目搬下来用CompositionAPI**重构**了一下。

`todoMVC`就是一个待办事项的小应用，功能有：

1. 本地缓存，并动态存储到LocalStorage中
2. 新增代办事项
3. 点击完成代办事项，一键全部完成/未完成
4. 删除代办事项
5. 清空已完成的代办事项
6. 根据完成状态筛选代办事项列表

![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a4dbf3df9d49450c91dfc33a8931b6a9~tplv-k3u1fbpfcp-watermark.image)

（刁钻的朋友可能发现我把编辑功能阉割掉了，这里确实偷了个懒，当时写得比较着急，又因为一些兼容性的原因，编辑状态点不出来，一气之下把编辑阉了....其实有没有也不太影响我想要说明的东西）

来码，整个代办事项组件：`TodoMVC.vue`

```typescript
import {defineComponent} from "vue"
import useTodoState from "@/views/TodoMVC/useTodoState";
import useFilterTodos from "@/views/TodoMVC/useFilterTodos";
import useHashChange from "@/views/TodoMVC/useHashChange";

export default defineComponent({
  setup() {

    /*响应式变量、新增和删除代办事项的方法*/
    const {
      todos,
      newTodo,
      visibility,
      addTodo,
      removeTodo
    } = useTodoState()

    // 筛选数据、一键全部完成/未完成、清空全部已完成事项
    const {
      filteredTodos,
      remaining,
      allDone,
      filters,
      removeCompleted
    } = useFilterTodos(todos, visibility)


    // 监听路由哈希变化
    useHashChange(filters, visibility)


    return {
      todos,
      newTodo,
      filteredTodos,
      remaining,
      allDone,
      visibility,
      removeCompleted,
      addTodo,
      removeTodo,
    }
  },

})
```

`useTodoState`中又调用了一个`本地存储`逻辑相关的composition function：`useTodoStorage.ts`

`useTodoState.ts`:

```ts
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
```



用于本地缓存的`useTodoStorage.ts`：

```ts
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

    // 用于新增代办事项的id自动生成
    const uid = ref(~~(localStorage.getItem('uid') || 0));
    watchEffect(() => localStorage.setItem('uid', uid.value.toString()))

    return {
        fetch,
        save,
        uid
    }

}
```

其他就不一一展示了，代码最终都放在文末的链接中的**github**仓库里了，感兴趣的可以细品。这个demo因为写得比较仓促，自我感觉写得不咋滴，逻辑的组织有待商榷，这也从侧面展示了composition API给我们带来的**高灵活组织和复用能力**，至于如何把代码组织得更漂亮就是开发者自己的事了，我也在试图慢慢摸索出写得更舒服的**最佳实践**。

### 与React Hooks对比

* 同样的逻辑组合、复用能力
* 只调用一次
  * 符合 JS 直觉
  * 没有闭包变量问题
  *  没有内存/GC 压力 
  * 不存在内联回调导致子组件永远更新的问题

不可置否，Composition API的诞生确实受到了React Hooks的启发，如果因此就贴上抄袭的标签就未免太流于表面了，也不想在此去引战。框架都是好框架，前端圈内要**以和为贵**，互相借鉴学习难道不好吗，不要搞窝里斗。

事实上，Composition API的**实现与使用方式**也都是**截然不同**的，懂得自然懂。

与React Hooks的对比也已经有不少文章说得挺详细了，这里就不再进行赘述。

简单来说就是得益于**响应式系统**，Composition API 使用的**心智负担**相比之下实在是小太多了。



## Fragment

这个新特性比较简单，就是在模板中可以写**多个根节点**。至于它的意义：

* 减少无意义的根节点元素
* 可以**平级递归**组件

第二个意义比较重要，利用这个新特性，比如可以写一个骚气的**快速排序组件**。

`QuickSort.vue`:

```ts
<template>
  <quick-sort :list="left" v-if="left.length"></quick-sort>
  <span class="item">{{ flag }}</span>
  <quick-sort :list="right" v-if="right.length"></quick-sort>
</template>


<script lang="ts">
import {defineComponent, ref} from "vue"

export default defineComponent({
  name: 'quick-sort',
  props: ["list"],
  setup(props) {
    // eslint-disable-next-line vue/no-setup-props-destructure
    const flag: number = props.list[0]
    const left = ref<number[]>([])
    const right = ref<number[]>([])

    setTimeout(() => {
      props.list.slice(1).forEach((item: number) => {
        item > flag ? right.value.push(item) : left.value.push(item)
      })
    }, 100)

    return {
      flag,
      left,
      right
    }
  }
})
</script>
```

在页面组件`Fragment.vue`中使用：

```vue
<template>
  <h1>快速排序</h1>
  <h2>
    {{ list }}
  </h2>
  <div>
    <button @click="ok = !ok">SORT</button>
  </div>
  <hr>
  <template v-if="ok">
    <QuickSort :list="list"></QuickSort>
  </template>
</template>

<script lang="ts">
import QuickSort from "@/components/QuickSort.vue";
import {defineComponent, ref} from "vue"
import {shuffle} from "lodash"

export default defineComponent({
  components: {
    QuickSort
  },
  setup() {
    const ok = ref(false)
    const list = ref<number[]>([])
    for (let i = 1; i < 20; i++){
      list.value.push(i)
    }
    list.value = shuffle(list.value)
    return {list, ok}
  }
})
</script>
```

向`QuickSort`中传入一个长度为20被打乱顺序的**数组**：

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5c06e43d83a74d48858e5d5b4136b87f~tplv-k3u1fbpfcp-watermark.image)

可以看到，每个递归的组件都是**平级**的：
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9eec3d53cdb54ae8b14af4e48b83c472~tplv-k3u1fbpfcp-watermark.image)

而在Vue2中的递归组件往往是**层层嵌套**的，因为它只能存在一个根元素，同样的写法在Vue2中将会报错。

利用这一特性，我们就可以写一个干净的**树组件**等等了。



## Suspense

可以理解为**异步组件的爹**。用于方便地控制异步组件的一个**挂起**和**完成**状态。

直接上代码，

首先是一个异步组件，`AsyncComponent.vue`：

```vue
<template>
  <h2>AsyncComponent</h2>
</template>
<script lang="ts">
import {defineComponent} from "vue"

export default defineComponent({
  props: {
    timeout:{
      type: Number,
      required: true
    }
  },
  async setup(props) {
    const sleep = (timeout: number) => {
      return new Promise(resolve => {
        setTimeout(resolve, timeout)
      })
    }
    await sleep(props.timeout)
  }
})
</script>
```

在页面组件`Suspense.vue`中：

```vue
<template>
  <h1>Suspense</h1>
  <Suspense>
    <template #default>
      <AsyncComponent :timeout="5000"/>
    </template>

    <template #fallback>
      <p class="loading">loading {{ loadingStr }}</p>
    </template>
  </Suspense>
</template>

<script lang="ts">
import {defineComponent} from "vue"
import AsyncComponent from "@/components/AsyncComponent.vue"
import useLoading from "@/composables/useLoading";

export default defineComponent({
  components: {
    AsyncComponent
  },
  setup() {
    const {loading: loadingStr} = useLoading()
    return {loadingStr}
  }
})
</script>
```

简单来说，就是用Vue3提供的内置组件：`Suspense`将异步组件包起来，`template #default`中展示加载完成的异步组件，`template #fallback`中则展示异步组件挂起状态时需要显示的内容。

看看效果：

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/32bb81fb97554daf8598f62c6e1bfa2a~tplv-k3u1fbpfcp-watermark.image)

## Teleport

理解为**组件任意门**，让你的组件可以任意地丢到html中的任一个DOM下。在react中也有相同功能的组件——**Portal**，之所以改名叫**Teleport**是由于**html**也准备提供一个原生的protal标签，为了避免重名就叫做Teleprot了。

利用这个特性，我们可以做的事情就比较有想象空间了。例如，写一个`Ball`组件，让它在不同的父组件中呈现不一样的样式甚至是逻辑，这些**样式**和**逻辑**可以写在父组件中，这样当这个Ball组件被传送到某个父组件中，就可以将父组件对其定义的样式和逻辑应用到Ball组件中了。再例如，可以在任意层级的组件中写一个需要挂载到外面去的子组件，比如一个**Modal弹窗**，虽然挂载在当前组件下也可以达到效果，但是有时候当前组件的根节点的样式可能会与之发生一些干扰或者冲突。

这里，我写了一个Modal弹窗的demo：

```vue
<template>
  <h1>Teleport——任意门</h1>
  <div class="customButton" @click="handleToggle">偷袭</div>
  <teleport to="body">
    <TeleportModal v-if="isOpen" @click="handleToggle"></TeleportModal>
  </teleport>
</template>

<script lang="ts">
import {defineComponent, ref} from "vue"
import TeleportModal from "@/components/TeleportModal.vue"

export default defineComponent({
  components: {
    TeleportModal
  },
  setup() {
    const isOpen = ref(false)
    const handleToggle = () => {
      isOpen.value = !isOpen.value
    }

    return {
      isOpen,
      handleToggle
    }
  }
})
</script>
```

用Vue3内置的`Teleport`组件将需要被传送的Modal组件包起来，写好要被传送到的元素选择器。（有点像**寄快递**，用快递盒打包好，写上收货地址，起飞）

看看这个demo的效果：
![](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/720ed26754b8446387d6bb09eabb4a6b~tplv-k3u1fbpfcp-watermark.image)
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/63f846d72d8d4e0d8b66cb97e06099b4~tplv-k3u1fbpfcp-watermark.image)

可以看到，马保国确实被踢到body下面去了(🐶)。



## createRenderer API

利用这个API，在Vue3中我们可以自由方便地去构建**Web（浏览器）平台**或**非Web平台**的**自定义渲染器**。

原理大概就是：将**Virtual DOM**和**平台相关**的渲染**分离**，通过**createRendererAPI**我们可以自定义Virtual DOM渲染到某一平台中时的所有**操作**，比如**新增**、**修改**、**删除**一个“元素”，我们可以这些方法中替换或修改为我们**自定义的逻辑**，从而打造一个我们**自定义的渲染器**。

当然，在**web平台**下是相对比较简单的，因为可以利用Vue的`runtime-dom`给我们提供的一个上层的**抽象层**，它帮我们完成了Virtual DOM渲染到Web DOM中的复**杂浏览器接口编程操作**，我们只需要在**createRenderer**的参数中传入一些**自定义的逻辑操作**即可自动完成整合，比如你可以在`createElement`方法中加一段自己的逻辑：
![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/584674e535da4017a2fa0d11b732c3da~tplv-k3u1fbpfcp-watermark.image)
这样在每次**创建新元素**的时候都会跟你“打招呼”。

调用**createRenderer**以后的返回值是一个**renderer**，**createApp**这个方法就是这个renderer的一个属性方法，用它替代原生的createApp方法就可以使用我们自己的**自定义渲染器**了~

为此，我准备了一个用**Three.js**和自定义渲染器实现的**3D方**块demo，并且用**composition API**将我们之前写的侦听鼠标位置的逻辑复用过来，让这个3D方块跟着我们的鼠标旋转。

首先，写一个**自定义渲染器**：`renderer.js`:

```js
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


```

`App.vue`，这里写一些对真实DOM的**操作逻辑**，比如我把`meshX`和`meshY`设置为了获取鼠标位置这个composition function 返回的鼠标**x**和**y**的计算属性值（为了减小旋转的灵敏度）。

```vue
<template>
  <div
      camera="PerspectiveCamera"
      :cameraPos={z:1}
      scene="Scene"
      geometry="BoxGeometry"
      :geometryArg="[0.2,0.2,0.2]"
      material="MeshNormalMaterial"
      mesh="Mesh"
      :meshY="y"
      :meshX="x"
  >
  </div>

</template>

<script>
import {computed} from 'vue'
import useMousePosition from "./useMousePosition";

export default {
  setup() {
    const {x: mouseX, y: mouseY} = useMousePosition()
    const x = computed(() => (mouseY.value)/200)
    const y = computed(() => (mouseX.value)/200)
    return {x,y}
  }
}
</script>
<style>

body {
  padding: 0;
  margin: 0;
  overflow: hidden;
}
</style>
```

最后，在main.js中使用我们刚刚在`renderer.js`中封装的带有自定义渲染器的`customCreateApp`方法替换普通的**createApp**方法，即可：

```js
import { customCreateApp } from './renderer';
import App from "./App.vue";

customCreateApp(App).mount("#app")
```

我们看看最终的效果：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c3f28621d17143c886584828521ac3e3~tplv-k3u1fbpfcp-watermark.image)

因缺思厅！





## One more thing —— Vite

最后，号称面向未来的构建工具**Vite**。

`yarn dev` 啪地一下应用就起来了，很**快**啊。

它的原理就是一个基于浏览器原生 **ES imports** 的开发服务器。利用**浏览器**去**解析** imports，在服务器端**按需编译**返回，完全跳过了**打包**这个概念，服务器随起随用。支持 **.vue文件** 和**热更新**，并且热更新的**速度**不会随着模块增多而变慢。

当然，**生产环境**的构建还是使用的**rollup**进行打包。它的香是在于**开发环境**的调试速度。

为了更好地理解它的工作原理，我找了蜗牛老湿画的一张图：
![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/13cfa102fedb416990e6f348aeb607e6~tplv-k3u1fbpfcp-watermark.image)

然后，我创建了一个vite的演示demo，用来看看**Vite**是怎么处理我们的文件的。

```
yarn create vite-app vite-demo
cd vite-demo && yarn && yarn dev
```

打开**http://localhost:3000/**

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/237485007ef24e8e875c755f3705bd75~tplv-k3u1fbpfcp-watermark.image)
看到localhost的请求结果，依然是保留了**ES Module**类型的代码

然后Vite的服务器拦截到你对`main.js`的请求，然后返回main.js的内容给你，里面依然是**ES Module**的类型，

又拦截到`vue.js`、`App.vue`，继续返回相应的内容给你，如此类推……

所以Vite应用启动的过程完全跳过了**打包编译**，让你的应用秒起。文件的热更新也是如此，比如当你修改了**App.vue**的内容，它又拦截给你返回一个新的**编译过后**的App.vue文件：

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d2c0d9d72cf14f9d8a6322319cdb73ec~tplv-k3u1fbpfcp-watermark.image)


对于大型的项目来说，这种毫秒级的响应实在是太舒服了。去年参与过一个内部组件库的开发工作，当时是修改的**webpack**插件，每次修改都得重启项目，每次重启就是**四五分钟**往上，简直感觉人要裂开。

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/48b855ced99a48eeabda7b02d5021fe6~tplv-k3u1fbpfcp-watermark.image)

当然，也不至于到可以完全**取代**Webpack的夸张地步，因为**Vite**还是在**开发阶段**，许多**工程化**的需求还是难以满足的，比如Webpack丰富的周边**插件**等等。



# 写在最后
> 总算是肝完了万字长文，真的可太难了。<br/>
> 当然，文中可能会存在或多或少的不足、错误之处，如果有建议或者意见非常欢迎大家在**评论**交流。<br/>
> 文中所用的所有Demo都放在这个仓库下：[GitHub传送门](https://github.com/ChanningHan/talk-about-vue3)。<br/>
> 最后，感谢大家可以耐心地读到这里，如果顺手的话希望可以**点赞**评论关注三连，因为这些就是我分享的全部**动力**来源🙏🙏🙏。
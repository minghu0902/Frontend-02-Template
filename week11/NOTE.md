学习笔记

#### 一、proxy与双向绑定

  ##### 1、通过 Proxy 实现对象原生操作的代理

  ```js
    // 用来保存当前被代理的对象
    let reactivities = new Map()

    function reactive(obj) {
      // 如果当前对象已被代理，则返回即可
      if (reactivities.has(obj)) {
        return reactivities.get(obj)
      }

      // 对象代理
      let proxy = new Proxy(obj, {
        get(target, prop) {
          return target[prop]
        },
        set(target, prop, value) {
          target[prop] = value
        }
        // 其他原生api操作
      })

      // 将当前的 proxy 保存到 reactivities 中
      // 为了避免对一个对象重复代理
      reactivities.set(obj, proxy)

      return proxy
    }
  ```
  
  ##### 2、依赖收集

  ```js
    // 保存当前使用的响应式对象
    let useReactivities = []
    // 用来保存对象与callback的映射
    let callbacks = new Map()

    function effect(callback) {
      useReactivities = []
      // 首先手动调用callback函数
      // 此时只要在 callback 中用到了被代理了的对象
      // 就会在 reactive 函数中触发 get 函数的调用
      // 以此来收集当前用到的被代理的对象
      callback()

      // 遍历 useReactivities
      // 建立 对象 - 属性 - callback 之间的映射关系
      // 用来优化当某个属性变化时，只触发当前属性的 callback 即可
      for (const reactivity of useReactivities) {
        // 判断对象是否在 callbacks 中存在
        if (!callbacks.has(reactivity[0])) {
          callbacks.set(reactivity[0], new Map())
        }
        // 判断对应的属性是否在 callbacks 中存在
        if (!callbacks.get(reactivity[0]).has(reactivity[1])) {
          callbacks.get(reactivity[0]).set(reactivity[1], [])
        }
        // 收集 callback
        callbacks.get(reactivity[0]).get(reactivity[1]).push(callback)
      }
    }

    function reactive(obj) {
      // 如果当前对象已被代理，则返回即可
      if (reactivities.has(obj)) {
        return reactivities.get(obj)
      }

      // 对象代理
      let proxy = new Proxy(obj, {
        get(target, prop) {

          // 收集当前使用到的对象
          useReactivities.push([target, prop])

          return target[prop]
        },
        set(target, prop, value) {
          target[prop] = value

          // 触发当前 target - prop 下对应的 callback
          if (callbacks.get(target)) {
            if (callbacks.get(target).get(prop)) {
              for (const callback of callbacks.get(target).get(prop)) {
                callback()
              }
            }
          }
        }
        // ...其他原生api操作
      })

      // 将当前的 proxy 保存到 reactivities 中
      // 为了避免对一个对象重复代理
      reactivities.set(obj, proxy)
      return proxy
    }
  ```

  ##### 3、双向绑定
  * model -> view
  * view -> model
  * reavtive函数的实现，即实现了对数据变化的监听，数据变化之后更新视图，也就是 model -> view 的过程
  * 在视图层，对页面元素的事件监听，触发数据的变化，也就是 view -> model 的过程


#### 二、正常流里的拖拽
  * 实现方式：使用 Range API 结合 CSSOM
  * 场景：在文本节点中实现正常流拖拽
  
  ##### 1、首先实现基本拖拽功能

  ```js
    //拖拽元素
    const oDragable = document.getElementById('dragable')

    // 记录元素的起始偏移量
    let baseX = 0, baseY = 0

    oDragable.addEventListener('mousedown', (event) => {

      // 记录鼠标按下的起始位置
      const startX = event.clientX
      const startY = event.clientY

      const move = (event) => {
        // 计算元素偏移量
        const x = baseX + event.clientX - startX
        const y = baseY + event.clientY - startY

        // 移动元素位置
        oDragable.style.transform = `translate(${x}px, ${y}px)`
      }

      const up = (event) => {
        // 计算并保存当次拖拽结束后，元素的偏移量
        baseX += event.clientX - startX
        baseY += event.clientY - startY

        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    })
  ```
  <br/> 

  ##### 2、正常流里的拖拽
  使用 [Range](https://developer.mozilla.org/zh-CN/docs/Web/API/Range) 找到文本节点中单个文字的可拖拽的空位
  
  * 实现思路
    * 建立 ranges 表，用来存储每个文字的文档片段
    * 鼠标移动的过程中，在 ranges 表中找到离当前拖拽元素最近的 range
    * 将当前拖拽元素插入到当前 range 中

  * 基于基本拖拽中，move 函数的变化
  ```js
    // mousemove处理函数
    const move = (event) => {
      // 找到离当前拖拽元素最近的 range
      const range = getNearest(event.clientX, event.clientY)
      // 将当前拖拽元素插入到当前 range 中
      range.insertNode(oDragable)
    }
  ```
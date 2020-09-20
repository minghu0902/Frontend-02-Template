学习笔记

#### 组件化

* 组件的基本组成部分
  * Properties
  * Methods
  * Inherit
  * Attribute
  * Config & State
  * Event
  * Lifecycle
  * Children

* 注意项
  * state 一致性，组件内部的 state 最好不能被组件的使用者改变, 但可以由用户的输入改变
  * config 一次性，只能在组件被构造的时候触发，且不可更改，通常会把 config 放在组件全局


#### 轮播图

* 轮播图中的难点
  * mousemove 和 mouseup 的过程中计算当前位置

* 优化的点
  * 因为一次最多展示2张图片，所以没必要遍历所有子节点进行位置变化，只需要计算出当前位置和下一个位置的点即可
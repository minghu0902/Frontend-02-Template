学习笔记

#### js中建立时间线的3中方式

```js
// 第一种方式
setInterval(() => {
  // TODO
}, 16)

// 第二种方式
const tick = () => {
  // TODO
  setTimeout(tick, 16)
}

// 第三种方式
const tick = () => {
  // TODO
  requestAnimationFrame(tick)
}
```
* 由于 setInterval 的不可控性，不知道浏览器什么时候会执行回调，所以不建议使用。
* 而后面两种 tick 回调的执行掌握具有可控性，比较可靠
* setTimeout 的方式可兼容老版本的浏览器，封装的时候可结合后两者使用
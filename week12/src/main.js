import { Component, createElement } from './framework'


class Carousel extends Component {
  constructor() {
    super()
    this.attributes = Object.create(null)
  }
  render() {
    this.root = document.createElement('div')
    this.root.classList.add('carousel')

    for (const item of this.attributes.src) {
      const child = document.createElement('div')
      child.style.backgroundImage = `url(${item})`
      child.style.backgroundSize = 'contain'
      this.root.appendChild(child)
    }
    
    let children = this.root.children
    let position = 0
    this.root.addEventListener('mousedown', event => {
      const startX = event.clientX

      const move = (event) => {
        const x = event.clientX - startX
        // 计算当前位置，x 超过 500 需要重新计算 position
        // 如果 x > 0，则 position -= Math.floor(x / 500)
        // 如果 x < 0，则 position -= Math.ceil(x / 500)
        const current = position - (x > 0 ? Math.floor(x / 500) : Math.ceil(x / 500))

        for (const offset of [-1, 0, 1]) {
          const pos = (offset + current + children.length) % children.length
          children[pos].style.transition = 'none'
          children[pos].style.transform = `translateX(${(offset - pos) * 500 + x % 500}px)`
        }
      }

      const up = (event) => {
        const x = event.clientX - startX

        // 计算当前位置
        position = (position - Math.round(x / 500) + children.length) % children.length
        
        for (const offset of [0, Math.sign(Math.abs(x % 500) >= 250 ? x : -x)]) {
          const pos = (offset + position + children.length) % children.length
          children[pos].style.transition = ''
          children[pos].style.transform = `translateX(${(offset - pos) * 500}px)`
        }

        document.removeEventListener('mousemove', move)
        document.removeEventListener('mouseup', up)
      }

      document.addEventListener('mousemove', move)
      document.addEventListener('mouseup', up)
    })

    // this.autoplay()

    return this.root
  }
  autoplay () {
    let currentIndex = 0
    let children = this.root.children

    setInterval(() => {
      currentIndex = currentIndex % children.length
      let nextIndex = (currentIndex + 1) % children.length
      
      let current = children[currentIndex]
      let next = children[nextIndex]

      // 先移动下一个元素到正确的位置
      // 这个过程不需要动画过渡
      next.style.transition = 'none'
      next.style.transform = `translateX(${100 - nextIndex * 100}%)`
      

      // 将真正的轮播放到下一帧
      setTimeout(() => {
        // 恢复动画过渡
        next.style.transition = ''
        // 移动当前元素的位置
        current.style.transform = `translateX(${-(currentIndex + 1) * 100}%)`
        // 移动下一个元素的位置
        next.style.transform = `translateX(${-nextIndex * 100}%)`

        currentIndex = nextIndex
      }, 16)
    }, 3000)
  }
  setAttribute(name, value) {
    this.attributes[name] = value
  }
  appendChild(child) {
    this.children.push(child)
  }
  mountTo(parent) {
    parent.appendChild(this.render())
  }
}


const imgs = [
  'https://static001.geekbang.org/resource/image/50/fe/5022c19ab75d3b0215a276167a69b2fe.jpg',
  'https://static001.geekbang.org/resource/image/57/37/57f5bd423b2afb7602b8a22d0559b737.jpg',
  'https://static001.geekbang.org/resource/image/a6/f1/a691e6b628ceb9d7c2ca9780126301f1.jpg',
  'https://static001.geekbang.org/resource/image/ee/1c/ee5415f97405929ec61a586991e2111c.jpg'
]

const a = <Carousel src={imgs}></Carousel>

a.mountTo(document.body)


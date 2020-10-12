import { Animation, TimeLine, easeOut } from 'animation'
import { enableGesture } from 'gesture'
import { Component, STATE, ATTRIBUTES } from './framework'

export class Carousel extends Component {
  constructor() {
    super()
    this[STATE].position = 0
  }
  render() {
    this.root = document.createElement('div')
    this.root.classList.add('carousel')

    for (const item of this[ATTRIBUTES].src) {
      const child = document.createElement('div')
      child.style.backgroundImage = `url(${item.img})`
      child.style.backgroundSize = 'contain'
      this.root.appendChild(child)
    }

    enableGesture(this.root)
    const timeLine = new TimeLine()
    timeLine.start()

    let handler = null
    let children = this.root.children
    let t = 0
    let ax = 0

    this.root.addEventListener('start', (event) => {
      timeLine.pause()
      clearInterval(handler)
      const now = Date.now()
      if (now - t < 500) {
        let progress = (now - t) / 500
        ax = easeOut(progress) * 500 - 500
      } else {
        ax < 0
      }
    })

    this.root.addEventListener('tap', (event) => {
      this.triggerEvent('click', {
        data: this[ATTRIBUTES].src[this[STATE].position],
        position: this[STATE].position
      })
    })

    this.root.addEventListener('pan', (event) => {
      let position = this[STATE].position
      const x = event.clientX - event.startX - ax
      const current = position - ((x - x % 500) / 500)

      for (const offset of [-1, 0, 1]) {
        const pos = ((offset + current) % children.length + children.length) % children.length
        children[pos].style.transform = `translateX(${(offset - pos) * 500 + x % 500}px)`
      }
    })

    this.root.addEventListener('end', (event) => {
      timeLine.reset()
      timeLine.start()
      handler = setInterval(nextPicture, 3000)
      
      let position = this[STATE].position
      const x = event.clientX - event.startX - ax
      const current = position - ((x - x % 500) / 500)

      const direction = Math.round((x % 500) / 500)

      if (event.isFlick) {
        if(event.velocity < 0) {
          direction = Math.ceil((x % 500) / 500)
        } else {
          direction = Math.floor((x % 500) / 500)
        }
      }
      
      for (const offset of [-1, 0, 1]) {
        const pos = ((offset + current) % children.length + children.length) % children.length
    
        timeLine.add(new Animation(children[pos].style, 'transform',
          (offset - pos) * 500 + x % 500,
          (offset - pos) * 500 + direction * 500,
          500, 0, easeOut, v => `translateX(${v}px)`))
      }

      this[STATE].position = position - ((x - x % 500) / 500) - direction
      this[STATE].position = (position % children.length + children.length) % children.length
      this.triggerEvent('change', { position: this[STATE].position })
    })

    
    let nextPicture = () => {
      let position = this[STATE].position % children.length
      let nextIndex = (position + 1) % children.length
      
      let current = children[position]
      let next = children[nextIndex]

      next.style.transform = `translateX(${100 - nextIndex * 100}%)`

      t = Date.now()

      timeLine.add(new Animation(current.style, 'transform',
         -position * 500, -500 -position * 500, 500, 0, easeOut, v => `translateX(${v}px)`))

      timeLine.add(new Animation(next.style, 'transform',
         500 - nextIndex * 500, -nextIndex * 500, 500, 0, easeOut, v => `translateX(${v}px)`))

      this[STATE].position = nextIndex
      this.triggerEvent('change', { position: nextIndex })
    }

    handler = setInterval(nextPicture, 3000)

    return this.root
  }
  appendChild(child) {
    this.children.push(child)
  }
}

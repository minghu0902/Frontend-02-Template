import { createElement } from './libs/framework'
import { Carousel } from './libs/carousel'
import { Animation, TimeLine } from './libs/animation'

const imgs = [
  'https://static001.geekbang.org/resource/image/50/fe/5022c19ab75d3b0215a276167a69b2fe.jpg',
  'https://static001.geekbang.org/resource/image/57/37/57f5bd423b2afb7602b8a22d0559b737.jpg',
  'https://static001.geekbang.org/resource/image/a6/f1/a691e6b628ceb9d7c2ca9780126301f1.jpg',
  'https://static001.geekbang.org/resource/image/ee/1c/ee5415f97405929ec61a586991e2111c.jpg'
]

const a = <Carousel src={imgs}></Carousel>

a.mountTo(document.body)

let obj = {
  set a(v) {
    console.log(v)
  }
}

window.timeline = new TimeLine()
window.animation = new Animation(obj, 'a', 0, 100, 1000, null)

timeline.add(animation)
timeline.start()
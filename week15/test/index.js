import { Animation, TimeLine } from 'animation'
import { createElement } from '../core/framework'
import { Carousel } from '../core/carousel'
import { Button } from '../core/Button'
import { List } from '../core/List'

const imgs = [
  {
    img: 'https://static001.geekbang.org/resource/image/50/fe/5022c19ab75d3b0215a276167a69b2fe.jpg',
    url: 'https://www.geekbang.org',
    title: '01'
  },
  {
    img: 'https://static001.geekbang.org/resource/image/57/37/57f5bd423b2afb7602b8a22d0559b737.jpg',
    url: 'https://www.geekbang.org',
    title: '02'
  },
  {
    img: 'https://static001.geekbang.org/resource/image/a6/f1/a691e6b628ceb9d7c2ca9780126301f1.jpg',
    url: 'https://www.geekbang.org',
    title: '03'
  },
  {
    img: 'https://static001.geekbang.org/resource/image/ee/1c/ee5415f97405929ec61a586991e2111c.jpg',
    url: 'https://www.geekbang.org',
    title: '04'
  }
]

const a = (
  <Carousel
    src={imgs}
    onChange={ event => console.log(event) }
    onClick={ event => console.log(event) }
  ></Carousel>
);
a.mountTo(document.body)


const b = <Button>content</Button>
b.mountTo(document.body)

const c = <List data={imgs}>
  {
    (record) => <div>
      <img src={record.img}></img>
      <a href={record.url}>{record.title}</a>
    </div>
  }
</List>
c.mountTo(document.body)
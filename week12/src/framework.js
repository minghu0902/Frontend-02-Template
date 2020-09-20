
export function createElement(type, attrs, ...children) {
  let element

  if (typeof type === 'string') {
    element = new ElementWrapper(type)
  } else {
    element = new type
  }

  for (const key in attrs) {
    element.setAttribute(key, attrs[key])
  }

  for (let child of children) {
    if (typeof child === 'string') {
      child = new TextWrapper(child)
    }
    element.appendChild(child)
  }

  return element
}


export class Component {
  constructor() {
    this.root = document.createElement('div')
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
  appendChild(child) {
    child.mountTo(this.root)
  }
  mountTo(parent) {
    parent.appendChild(this.root)
  }
}

class TextWrapper extends Component {
  constructor(type) {
    super()
    this.root = document.createTextNode(type)
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    super()
    this.root = document.createElement(type)
  }
}

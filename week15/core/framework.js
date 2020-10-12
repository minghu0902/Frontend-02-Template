
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

  const processChildren = (children) => {
    for (let child of children) {
      if (typeof child === 'object' && Array.isArray(child)) {
        processChildren(child)
        continue
      } else if (typeof child === 'string') {
        child = new TextWrapper(child)
      }
      element.appendChild(child)
    }
  }

  processChildren(children)

  return element
}

export const STATE = Symbol('state')
export const ATTRIBUTES = Symbol('attributes')

export class Component {
  constructor() {
    this[ATTRIBUTES] = Object.create(null)
    this[STATE] = Object.create(null)
  }
  render() {
    return this.root
  }
  setAttribute(name, value) {
    this[ATTRIBUTES][name] = value
  }
  appendChild(child) {
    child.mountTo(this.root)
  }
  mountTo(parent) {
    if (!this.root) {
      this.root = this.render()
    }
    parent.appendChild(this.root)
  }
  triggerEvent(type, args) {
    type = type.replace(/^[\s\S]/, s => s.toUpperCase())
    this[ATTRIBUTES]['on' + type](new CustomEvent(type, { detail: args }))
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
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
}

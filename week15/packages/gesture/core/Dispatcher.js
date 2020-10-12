export class Dispatcher {

  constructor(element) {
    this.element = element
  }

  dispatch(type, properties) {
    let event = new Event(type)
    for (const key in properties) {
      event[key] = properties[key]
    }
    this.element.dispatchEvent(event)
  }
}
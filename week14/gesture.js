export class Listener {

  constructor(element, recognizer) {
    this.element = element
    this.recognizer = recognizer

    const contextMap = new Map()
    let isListeningMouse = false

    element.addEventListener('mousedown', (event) => {
      const context = Object.create(null)
      contextMap.set('mouse' + (1 << event.button), context)
      this.recognizer.start(event, context)

      const mousemove = (event) => {
        const buttons = event.buttons
        let button = 1

        while(button <= buttons) {
          if (button & buttons) {
            // buttons和button值的中键和右键顺序不一样，需要交换一下位置
            let key
            if (button === 2) {
              key = 4
            } else if (button === 4) {
              key = 2
            } else {
              key = button
            }
            this.recognizer.move(event, contextMap.get('mouse' + key))
          }
          button = button << 1
        }
      }
      const mouseup = (event) => {
        this.recognizer.end(event, contextMap.get('mouse' + (1 << event.button)))
        contextMap.delete('mouse' + (1 << event.button))
        
        if (event.buttons === 0) {
          element.removeEventListener('mousemove', mousemove)
          element.removeEventListener('mouseup', mouseup)
          isListeningMouse = false
        }
      }

      if (!isListeningMouse) {
        element.addEventListener('mousemove', mousemove)
        element.addEventListener('mouseup', mouseup)
        isListeningMouse = true
      }
    })

    element.addEventListener('touchstart', (event) => {
      for (const touch of event.changedTouches) {
        let context = Object.create(null)
        contextMap.set(touch.identifier, context)
        this.recognizer.start(touch, context)
      }
    })

    element.addEventListener('touchmove', (event) => {
      for (const touch of event.changedTouches) {
        this.recognizer.move(touch, contextMap.get(touch.identifier))
      }
    })

    element.addEventListener('touchend', (event) => {
      for (const touch of event.changedTouches) {
        this.recognizer.end(touch, contextMap.get(touch.identifier))
        contextMap.delete(touch.identifier)
      }
    })

    element.addEventListener('touchcancel', (event) => {
      for (const touch of event.changedTouches) {
        this.recognizer.cancel(touch, contextMap.get(touch.identifier))
        contextMap.delete(touch.identifier)
      }
    })
  }
}

export class Recognizer {

  constructor(dispatcher) {
    this.dispatcher = dispatcher
  }

  start(point, context) {
    context.isTap = true
    context.isPan = false
    context.isPress = false
    context.startX = point.clientX
    context.startY = point.clientY
    context.points = [{
      t: Date.now(),
      x: point.clientX,
      y: point.clientY
    }]
  
    context.handler = setTimeout(() => {
      context.isTap = false
      context.isPress = true
      context.isPan = false
      context.handler = null
      this.dispatcher.dispatch('pressstart', {
        clientX: point.clientX,
        clientY: point.clientY
      })
    }, 500)
  }

  move(point, context) {
    let dx = point.clientX - context.startX
    let dy = point.clientY - context.startY
  
    if (!context.isPan && dx ** 2 + dy ** 2 >= 100) {
      context.isTap = false
      context.isPress = false
      context.isPan = true
      context.isVertical = Math.abs(dx) < Math.abs(dy)
      clearTimeout(context.handler)
      this.dispatcher.dispatch('panstard', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical
      })
    }
    if (context.isPan) {
      this.dispatcher.dispatch('pan', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical
      })
    }
  
    context.points = context.points.filter(point => Date.now() - point.t < 500)
  
    context.points.push({
      t: Date.now(),
      x: point.clientX,
      y: point.clientY
    })  
  }

  end(point, context) {
    if (context.isTap) {
      this.dispatcher.dispatch('tap', {
        clientX: point.clientX,
        clientY: point.clientY
      })
      clearTimeout(context.handler)
    }
  
    if (context.isPress) {
      this.dispatcher.dispatch('pressend', {
        clientX: point.clientX,
        clientY: point.clientY
      })
    }
  
    if (context.points.length) {
      const d = Math.sqrt(
        (point.clientX - context.points[0].x) ** 2 +
        (point.clientY - context.points[0].y) ** 2
      )
      const v = d / (Date.now() - context.points[0].t)
  
      if (v > 1.5) {
        context.isFlick = true
        this.dispatcher.dispatch('flick', {
          startX: context.startX,
          startY: context.startY,
          clientX: point.clientX,
          clientY: point.clientY,
          isVertical: context.isVertical,
          isFlick: context.isFlick,
          velocity: v
        })
      } else {
        context.isFlick = false
      }
    }
  
    if (context.isPan) {
      this.dispatcher.dispatch('panend', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick
      })
    }
  }

  cancel(point, context) {
    clearTimeout(context.handler)
    this.dispatcher.dispatch('cancel', {})
  }
}

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

export function enableGesture(element) {
  new Listener(element, new Recognizer(new Dispatcher(element)))
}